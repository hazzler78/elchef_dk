import { NextRequest, NextResponse } from 'next/server';
import { PendingReminder } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper functions for precise date handling
function addMonthsKeepingEnd(date: Date, monthsToAdd: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setMonth(result.getMonth() + monthsToAdd);
  // If month rolled over (e.g., adding 1 month to Jan 31 → Mar 03), snap to last day of previous month
  if (result.getDate() < originalDay) {
    result.setDate(0);
  }
  return result;
}

function formatLocalYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper function to calculate reminder date (11 months before contract expiry)
function calculateReminderDate(contractStartDate: string, contractType: string): string {
  const startDate = new Date(contractStartDate);
  let totalMonths: number;

  switch (contractType) {
    case '12_months':
      totalMonths = 12;
      break;
    case '24_months':
      totalMonths = 24;
      break;
    case '36_months':
      totalMonths = 36;
      break;
    default:
      throw new Error('Invalid contract type');
  }

  // 11 months before expiry = start + (totalMonths - 11) months
  const reminderDate = addMonthsKeepingEnd(startDate, totalMonths - 11);
  return formatLocalYYYYMMDD(reminderDate);
}

// Helper function to send Telegram message
async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

// Parse contract response from team
function parseContractResponse(text: string): { contractType: string; startDate?: string } | null {
  const trimmed = text.trim();
  // Accept formats: "12m" or "12m YYYY-MM-DD"
  const simpleMatch = trimmed.match(/^(\d{1,2})m$/i);
  const fullMatch = trimmed.match(/^(\d{1,2})m\s+(\d{4}-\d{2}-\d{2})$/i);

  let months: number | null = null;
  let startDate: string | undefined;

  if (fullMatch) {
    months = parseInt(fullMatch[1]);
    startDate = fullMatch[2];
  } else if (simpleMatch) {
    months = parseInt(simpleMatch[1]);
  }

  if (!months) return null;

  let contractType: string;
  switch (months) {
    case 12:
      contractType = '12_months';
      break;
    case 24:
      contractType = '24_months';
      break;
    case 36:
      contractType = '36_months';
      break;
    default:
      return null;
  }

  return { contractType, startDate };
}

// POST: Handle Telegram webhook
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Handle only message updates
    if (!update.message || !update.message.text) {
      return NextResponse.json({ success: true });
    }

    const { message } = update;
    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // Determine target pending reminder using #ID in message or reply metadata
    // 1) Prefer explicit pattern in the operator's message: e.g., "12m #123"
    const inlineIdMatch = text.match(/#(\d+)/);
    let targetPending: PendingReminder | null = null;
    if (inlineIdMatch) {
      const id = parseInt(inlineIdMatch[1]);
      const { data, error } = await supabase
        .from('pending_reminders')
        .select('*')
        .eq('id', id)
        .limit(1);
      if (error) {
        console.error('Error fetching pending by inline ID:', error);
      }
      targetPending = (data && data.length > 0 ? (data[0] as PendingReminder) : null);
    }

    if (!targetPending && message.reply_to_message) {
      // 2) If replying: extract ID from the replied message
      const repliedText: string = message.reply_to_message.text || '';
      const replyIdMatch = repliedText.match(/\bID:\s*(\d+)\b/i);
      if (replyIdMatch) {
        const replyId = parseInt(replyIdMatch[1]);
        const { data, error } = await supabase
          .from('pending_reminders')
          .select('*')
          .eq('id', replyId)
          .limit(1);
        if (error) {
          console.error('Error fetching pending by reply ID:', error);
        }
        targetPending = (data && data.length > 0 ? (data[0] as PendingReminder) : null);
      } else {
        // 3) Fallback by email in the replied text
        const emailMatch = repliedText.match(/E-post:\s*([^\s]+)/i);
        if (emailMatch) {
          const email = emailMatch[1];
          const { data, error } = await supabase
            .from('pending_reminders')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1);
          if (error) {
            console.error('Error fetching pending by email:', error);
          }
          targetPending = (data && data.length > 0 ? (data[0] as PendingReminder) : null);
        }
      }
    }

    if (!targetPending) {
      await sendTelegramMessage(chatId, '❌ Kunde inte identifiera kunden. Svara på kontaktmeddelandet eller skriv t.ex. "12m #123" (använd ID från kortet).');
      return NextResponse.json({ success: true });
    }

      const pendingReminder = targetPending;
      
      // Parse the contract response (accepts '12m' or '12m YYYY-MM-DD')
      const contractInfo = parseContractResponse(text);
      
      if (contractInfo) {
        try {
          // Determine contract start date: if provided use it, otherwise use today
          const contractStart = contractInfo.startDate || new Date().toISOString().split('T')[0];
          // Calculate reminder date
          // If only "Xm" provided (no start date), remind in 11 months from today
          const reminderDate = contractInfo.startDate
            ? calculateReminderDate(contractStart, contractInfo.contractType)
            : formatLocalYYYYMMDD(addMonthsKeepingEnd(new Date(), 11));
          
          // Create reminder in database
          const reminderData = {
            customer_name: pendingReminder.customer_name,
            email: pendingReminder.email,
            phone: pendingReminder.phone,
            contract_type: contractInfo.contractType,
            contract_start_date: contractStart,
            reminder_date: reminderDate,
            is_sent: false,
            notes: `Skapad via Telegram svar: ${text}`
          };

          const { error } = await supabase
            .from('customer_reminders')
            .insert([reminderData])
            .select()
            .single();

          if (error) {
            console.error('Error creating reminder:', error);
            await sendTelegramMessage(chatId, '❌ Kunde inte skapa påminnelse. Försök igen.');
          } else {
            // Delete the pending reminder
            await supabase
              .from('pending_reminders')
              .delete()
              .eq('id', pendingReminder.id);

            // Calculate expiry date for confirmation message
            const startDate = new Date(contractStart);
            const expiryDate = new Date(startDate);
            switch (contractInfo.contractType) {
              case '12_months':
                expiryDate.setMonth(expiryDate.getMonth() + 12);
                break;
              case '24_months':
                expiryDate.setMonth(expiryDate.getMonth() + 24);
                break;
              case '36_months':
                expiryDate.setMonth(expiryDate.getMonth() + 36);
                break;
            }

            const confirmationMessage = `
✅ *Påminnelse skapad!*

👤 *Kund:* ${pendingReminder.customer_name}
📋 *Avtalstyp:* ${contractInfo.contractType === '12_months' ? '12 månader' : 
                  contractInfo.contractType === '24_months' ? '24 månader' : '36 månader'}
📅 *Startdatum:* ${startDate.toLocaleDateString('sv-SE')}
⏰ *Avtal går ut:* ${expiryDate.toLocaleDateString('sv-SE')}
🔔 *Påminnelse skickas:* ${new Date(reminderDate).toLocaleDateString('sv-SE')}

Påminnelse kommer skickas 11 månader före avtalsutgång.
            `;

            await sendTelegramMessage(chatId, confirmationMessage);
          }
        } catch (error) {
          console.error('Error processing contract response:', error);
          await sendTelegramMessage(chatId, '❌ Ett fel uppstod. Kontrollera formatet och försök igen.');
        }
      } else {
        await sendTelegramMessage(chatId, '❌ Felaktigt format. Skriv t.ex. "12m" eller "12m 2025-02-15". Du kan även ange ID: "12m #123".');
      }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Set webhook (call this once to configure Telegram)
export async function GET(request: NextRequest) {
  try {
    // Prefer the actual request origin (works across custom domains and environments)
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    const forwardedHost = request.headers.get('x-forwarded-host');
    const requestOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;

    // Optional override: /api/telegram-webhook?origin=https://www.example.com
    const originOverride = request.nextUrl.searchParams.get('origin');
    const webhookUrl = `${originOverride || requestOrigin}/api/telegram-webhook`;
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        drop_pending_updates: true
      }),
    });

    const result = await response.json();
    
    if (result.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook set successfully',
        webhookUrl 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.description 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}