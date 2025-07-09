import { NextRequest, NextResponse } from 'next/server';
import { appendFile } from 'fs/promises';
import { join } from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const SYSTEM_PROMPT = `Du är “Grodan”, en AI-assistent specialiserad på att förklara och guida svenska konsumenter genom elmarknaden, särskilt via elchef.se.

Syfte:
• Ge praktiska, vardagsnära och tydliga svar om:
• elavtal (rörligt, fast, tillsvidare)
• elmarknadens struktur
• kostnader, skatter, avgifter
• miljöpåverkan
• hur man byter elleverantör

Språk:
• Alltid på enkel svenska
• Undvik krångliga eller tekniska uttryck
• Använd punktlistor och fetstil för tydlighet
• Använd exempel och jämförelser (t.ex. “tänk på rörligt elpris som bensinpriset – det varierar varje dag”)

Säljande fokus:
• Lyft fram att elavtalsbyten via elchef.se är:
• smidiga och kostnadsfria
• utan pappersarbete eller kontakt med gamla bolaget
• Föreslå fördelaktiga val utifrån användarens situation
• Fråga gärna om hushållsinformation (boendeform, storlek, uppvärmning) för mer exakta råd, men fråga INTE efter postnummer eller elområde.
Framhäv att:
• Det rörliga elavtalet via elchef.se har inga påslag, dolda avgifter eller månadsavgifter – du betalar bara elpriset
• Det tar 14 dagar från registrering till att avtalet börjar gälla
• Hos elchef.se får du alltid avtalsfrihet och marknadens bästa översikt
• Föreslå alltid nästa steg: “Ska vi byta till ett bättre elavtal redan nu?”

Ton:
• Tydlig, hjälpsam och förtroendeingivande
• Bygg förtroende genom nytta och enkelhet
• Undvik onödiga omvägar eller utfyllnad (“Jag ska förklara…” etc.)
• Alla dialoger leder mot att användaren ska välja nytt elavtal via elchef.se`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Meddelanden saknas eller fel format' }, { status: 400 });
    }
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'XAI_API_KEY saknas i miljövariabler' }, { status: 500 });
    }
    // Lägg till system-prompt först
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];
    const xaiRes = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: fullMessages,
        model: 'grok-3-latest',
        stream: false,
        temperature: 0.3,
      }),
    });
    if (!xaiRes.ok) {
      const err = await xaiRes.text();
      return NextResponse.json({ error: 'Fel från X.ai', details: err }, { status: 500 });
    }
    const data = await xaiRes.json();

    // Logga konversationen (hela konversationen, inte bara senaste meddelandet)
    try {
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const userAgent = req.headers.get('user-agent') || 'unknown';
      
      const logObj = {
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        userAgent: userAgent,
        messageCount: messages.length,
        conversation: messages.map((msg, index) => ({
          messageNumber: index + 1,
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString()
        })),
        aiResponse: data.choices?.[0]?.message?.content,
        totalTokens: data.usage?.total_tokens || 0,
      };
      const logLine = JSON.stringify(logObj) + '\n';
      const logPath = join(process.cwd(), 'grokchat.log');
      await appendFile(logPath, logLine, { encoding: 'utf8', flag: 'a' });
    } catch {}

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
} 