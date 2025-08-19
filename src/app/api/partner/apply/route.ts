import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',').map(id => id.trim()) || [];

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      orgNumber,
      contactName,
      email,
      phone,
      website,
      partnershipType,
      estVolume,
      notes,
      ref,
      campaignCode,
    } = body;

    if (!companyName || !contactName || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ogiltiga fält' }, { status: 400 });
    }

    if (supabase) {
      await supabase.from('company_partner_applications').insert([{
        company_name: companyName,
        org_number: orgNumber || null,
        contact_name: contactName,
        email,
        phone: phone || null,
        website: website || null,
        partnership_type: partnershipType || null,
        est_volume: estVolume || null,
        notes: notes || null,
        ref: ref || null,
        campaign_code: campaignCode || null,
        created_at: new Date().toISOString(),
      }]);
    }

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_IDS.length > 0) {
      const msg = `
🤝 *Ny företags-partneransökan*

🏢 Företag: ${companyName}
🧾 Org.nr: ${orgNumber || '-'}
🙍 Kontakt: ${contactName}
📧 E-post: ${email}
📞 Telefon: ${phone || '-'}
🌐 Webb: ${website || '-'}
🔧 Typ: ${partnershipType || '-'}
📈 Volym: ${estVolume || '-'}
🏷️ Ref: ${ref || '-'}
🎟️ Kampanjkod: ${campaignCode || '-'}
📝 Notering: ${notes || '-'}
⏰ ${new Date().toLocaleString('sv-SE')}
`;
      await Promise.all(TELEGRAM_CHAT_IDS.map(chatId => fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
      })));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Partner apply error', e);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}


