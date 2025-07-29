import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',').map(id => id.trim()) || [];
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function sendTelegramNotification(data: ContactFormData) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_CHAT_IDS.length === 0) {
    console.warn('Telegram credentials not configured');
    return;
  }

  // Store pending reminder in database
  const pendingReminderData = {
    customer_name: data.name || 'Okänd',
    email: data.email,
    phone: data.phone || null,
    message: data.message || null,
    created_at: new Date().toISOString()
  };

  const { error: pendingError } = await supabase
    .from('pending_reminders')
    .insert([pendingReminderData])
    .select()
    .single();

  if (pendingError) {
    console.error('Error creating pending reminder:', pendingError);
  }

  const message = `
🔔 *Ny kontaktförfrågan*

${data.name ? `🙍‍♂️ *Namn:* ${data.name}\n` : ''}📧 *E-post:* ${data.email}
${data.phone ? `📞 *Telefon:* ${data.phone}\n` : ''}📰 *Nyhetsbrev:* ${data.subscribeNewsletter ? 'Ja' : 'Nej'}
${data.message ? `\n📝 *Meddelande:* ${data.message}` : ''}

⏰ *Tidpunkt:* ${new Date().toLocaleString('sv-SE')}
🌐 *Källa:* Elchef.se kontaktformulär

💡 *Svara med avtalstyp och startdatum för att skapa påminnelse:*
*Format:* "12m 2025-02-15" eller "24m 2025-02-15" eller "36m 2025-02-15"
`;

  // Send to all configured chat IDs
  const sendPromises = TELEGRAM_CHAT_IDS.map(async (chatId) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        console.error(`Telegram notification failed for chat ID ${chatId}:`, await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error sending Telegram notification to ${chatId}:`, error);
      return false;
    }
  });

  // Wait for all notifications to be sent
  const results = await Promise.all(sendPromises);
  const successCount = results.filter(Boolean).length;
  console.log(`Telegram notifications sent: ${successCount}/${TELEGRAM_CHAT_IDS.length} successful`);
}

async function addToMailerlite(email: string) {
  if (!MAILERLITE_API_KEY) {
    console.error('MAILERLITE_API_KEY saknas i miljövariabler');
    return false;
  }

  const body: Record<string, unknown> = {
    email: email,
    status: 'active',
  };
  
  if (MAILERLITE_GROUP_ID && !isNaN(Number(MAILERLITE_GROUP_ID))) {
    body.groups = [Number(MAILERLITE_GROUP_ID)];
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mailerlite API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding to Mailerlite:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validera e-postadress
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      );
    }

    // Skicka Telegram-notifiering
    await sendTelegramNotification(data);

    // Lägg till i Mailerlite om användaren vill prenumerera
    let newsletterSuccess = true;
    if (data.subscribeNewsletter) {
      newsletterSuccess = await addToMailerlite(data.email);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Kontaktförfrågan skickad',
        newsletterSubscribed: data.subscribeNewsletter && newsletterSuccess
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid skickande av kontaktförfrågan' },
      { status: 500 }
    );
  }
} 