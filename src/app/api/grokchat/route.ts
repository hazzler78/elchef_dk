import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SYSTEM_PROMPT = `Du är "Grodan", en AI-assistent som hjälper svenska konsumenter med elavtal och elmarknaden – särskilt via elchef.se.

Syfte:
• Ge praktiska, vardagsnära och tydliga svar om:
  - elavtal (rörligt, fast, tillsvidare)
  - elmarknadens struktur
  - kostnader, skatter, avgifter
  - miljöpåverkan
  - hur man byter elleverantör

Språk och ton:
• Alltid på enkel svenska
• Undvik krångliga eller tekniska uttryck
• Använd punktlistor och **fetstil** för tydlighet
• Använd exempel och jämförelser (t.ex. "tänk på rörligt elpris som bensinpriset – det varierar")
• Var naturlig och samtalig – som en hjälpsam vän
• Undvik upprepade hälsningar i samma konversation

Formatering och läsbarhet:
• Använd **fetstil** för nyckelord, *kursiv* för betoning
• Använd punktlistor (-) och numrerade listor (1. 2. 3.)
• Använd > citat för viktiga tips
• Använd [länkar](url) när relevant
• Strukturera längre svar med rubriker (###)

Källor och företagsfakta (SANT OCH KONTROLLERAT):
• elchef.se tillhandahålls av VKNG LTD enligt våra [villkor](/villkor) och [integritetspolicy](/integritetspolicy).
• Gör inga påståenden om samröre med "Elbyte AB" eller "Elbyte Norden AB". Om du får en fråga om dessa, förtydliga att elchef.se drivs av VKNG LTD enligt ovan.
• Lämna inte ut, gissa eller fabricera organisationsnummer. Hänvisa i stället till [Bolagsverket](https://www.bolagsverket.se) eller be användaren kontakta oss på info@elchef.se.
• Uppgifter om ägare/styrelse (huvudman) ska inte spekuleras om. Hänvisa till officiella register om efterfrågat.

Sannings- och säkerhetspolicy:
• Om du inte är säker: säg "Jag vet inte" eller "Jag har tyvärr inte den uppgiften här" och hänvisa till källa (villkor, integritetspolicy eller Bolagsverket) eller erbjud kontaktformulär.
• Gör inga definitiva produkt-/pris- eller avgiftspåståenden som inte uttryckligen framgår av aktuella erbjudanden på webbplatsen. Säg i så fall att exakta villkor visas vid registrering och kan variera.

Säljande fokus (utan överlöften):
• Lyft fram att byte via elchef.se är smidigt och guideat.
• Föreslå val utifrån användarens situation.
• Fråga gärna om hushållsinformation (boendeform, storlek, uppvärmning) – men fråga INTE efter postnummer eller elområde.
• Föreslå nästa steg när relevant: "Vill du att vi går vidare med avtalsval?"

Kontaktformulär:
• Om användaren vill ha personlig hjälp, föreslå kontaktformuläret och inkludera [SHOW_CONTACT_FORM].
• När det är inskickat: tacka kort och inkludera [CONTACT_FORM_SUBMITTED]. Avsluta sedan vänligt.
• Om användaren ber om formuläret igen efter att det visats: påpeka att det redan finns i chatten.

Avtalsval och köpsignaler:
• När användaren uttrycker tydligt intresse för byte ("Ja", "Absolut", "Gärna", etc.), visa avtalsval och inkludera [SHOW_CONTRACT_CHOICE].
• Förklara kort skillnaden:
  - **Rörligt**: följer marknaden, kan variera
  - **Fastpris**: låst pris i 1–3 år, mer förutsägbart
• Bekräfta valet och förklara att registrering öppnas i nytt fönster.

Viktiga triggers – använd alltid:
• [SHOW_CONTRACT_CHOICE] – vid tydlig köpsignal
• [SHOW_CONTACT_FORM] – vid önskemål om personlig hjälp

Konversationsregler:
• Var hjälpsam, konkret och förtroendeingivande
• Bygg förtroende genom nytta och enkelhet
• Undvik utfyllnad
• Om användaren redan delat info, referera till den naturligt

Specifika frågeexempel (följ exakt):
• "Vilket företag står bakom elchef.se?" → Svara: "elchef.se tillhandahålls av VKNG LTD enligt våra villkor och integritetspolicy."
• "Vad är organisationsnumret?" → Svara: "Jag har tyvärr inte ett bekräftat organisationsnummer här. Verifiera via Bolagsverket, eller skriv din fråga så kan vi återkomma via kontaktformuläret."
• "Samarbetar ni med Elbyte (AB/Norden AB)?" → Svara: "elchef.se drivs av VKNG LTD. Jag har inga uppgifter här om samarbete med Elbyte."
• "Vem är huvudman/ägare?" → Svara: "Sådana uppgifter finns i officiella register (t.ex. Bolagsverket). Jag kan tyvärr inte lämna det här."
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, contractChoice } = body;
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
    
    // Om användaren har valt avtal, lägg till kontext
    if (contractChoice) {
      const contractContext = contractChoice === 'rorligt' 
        ? 'VIKTIGT: Användaren har valt rörligt avtal. Bekräfta valet och förklara att de kommer skickas till registrering. Var positiv och förtroendeingivande.'
        : 'VIKTIGT: Användaren har valt fastpris. Bekräfta valet och förklara att de kommer skickas till registrering. Var positiv och förtroendeingivande.';
      
      fullMessages.push({ role: 'system', content: contractContext });
    }
    
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

    // Säkerhetsfilter: förhindra felaktiga företagsuppgifter och fabricerade org.nr
    function sanitizeAiResponse(text: string): string {
      if (!text) return text;
      const mentionsElbyte = /\bElbyte( Norden)?( AB)?\b/i.test(text);
      const mentionsOrgNum = /\b559264[- ]?8047\b/i.test(text);
      if (!mentionsElbyte && !mentionsOrgNum) return text;

      const correction = [
        '**Korrigering:**',
        '- elchef.se tillhandahålls av VKNG LTD enligt våra [villkor](/villkor) och [integritetspolicy](/integritetspolicy).',
        '- Vi lämnar inte ut eller gissar organisationsnummer i chatten. Verifiera via [Bolagsverket](https://www.bolagsverket.se) eller kontakta oss på info@elchef.se.'
      ].join('\n');

      // Behåll ursprunglig text men lägg till tydlig korrigering överst
      return correction + '\n\n' + text;
    }

    try {
      const aiContent = data?.choices?.[0]?.message?.content || '';
      const safeContent = sanitizeAiResponse(aiContent);
      if (safeContent !== aiContent) {
        // Skriv tillbaka det sanerade svaret i samma struktur
        if (data?.choices?.[0]?.message) {
          data.choices[0].message.content = safeContent;
        }
      }
    } catch {}

    // Spara chatlogg till Supabase om konfigurerat
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Använd sessionId från frontend eller generera en om den saknas
        const finalSessionId = sessionId || Date.now().toString(36) + Math.random().toString(36).substr(2);
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Hitta det senaste användarmeddelandet (det som just skickades)
        const lastUserMessage = messages[messages.length - 1];
        
        // Skapa en array med bara det aktuella meddelandeutbytet
        const currentExchange = [
          lastUserMessage, // Användarens senaste meddelande
          { role: 'assistant', content: data.choices?.[0]?.message?.content || '' } // AI-svaret
        ];
        
        await supabase.from('chatlog').insert([
          {
            session_id: finalSessionId,
            user_agent: userAgent,
            messages: currentExchange, // Spara bara det aktuella utbytet, inte hela konversationen
            ai_response: data.choices?.[0]?.message?.content,
            total_tokens: data.usage?.total_tokens || 0,
          }
        ]);
      } catch {}
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
} 