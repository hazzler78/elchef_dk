import { NextRequest, NextResponse } from 'next/server';
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
function parseContractResponse(text: string): { contractType: string; startDate: string } | null {
  // Expected format: "12m 2025-02-15" or "24m 2025-02-15" or "36m 2025-02-15"
  const match = text.match(/^(\d{1,2})m\s+(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;

  const months = parseInt(match[1]);
  const startDate = match[2];

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

    // Check if this is a reply to a contact notification
    if (message.reply_to_message) {
      // Get the most recent pending reminder for this chat
      const { data: pendingReminders, error: fetchError } = await supabase
        .from('pending_reminders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError || !pendingReminders || pendingReminders.length === 0) {
        await sendTelegramMessage(chatId, '❌ Ingen väntande kontaktförfrågan hittades.');
        return NextResponse.json({ success: true });
      }

      const pendingReminder = pendingReminders[0];
      
      // Parse the contract response
      const contractInfo = parseContractResponse(text);
      
      if (contractInfo) {
        try {
          // Calculate reminder date
          const reminderDate = calculateReminderDate(contractInfo.startDate, contractInfo.contractType);
          
          // Create reminder in database
          const reminderData = {
            customer_name: pendingReminder.customer_name,
            email: pendingReminder.email,
            phone: pendingReminder.phone,
            contract_type: contractInfo.contractType,
            contract_start_date: contractInfo.startDate,
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
            const startDate = new Date(contractInfo.startDate);
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
        await sendTelegramMessage(chatId, 
          '❌ Felaktigt format. Använd formatet: "12m 2025-02-15" eller "24m 2025-02-15" eller "36m 2025-02-15"'
        );
      }
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