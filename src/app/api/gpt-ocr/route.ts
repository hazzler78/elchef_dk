import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const consentRaw = formData.get('consent');
    const consent = typeof consentRaw === 'string' ? consentRaw === 'true' : false;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded or file is not a valid image.' }, { status: 400 });
    }

    // Läs filen som buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;
    const fileSize = (file as File).size ?? buffer.length;
    
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      return NextResponse.json({ error: 'Endast PNG och JPG stöds just nu.' }, { status: 400 });
    }

    // Konvertera bilden till base64
    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const imageSha256 = createHash('sha256').update(buffer).digest('hex');

    // OpenAI Vision prompt
    const systemPrompt = `Du är en expert på svenska elräkningar som hjälper användare identifiera extra kostnader, dolda avgifter och onödiga tillägg på deras elfakturor. 

**VIKTIGT - SPRÅK:**
- Du MÅSTE alltid svara på svenska, oavsett vilket språk fakturan är på
- Även om fakturan är på norska, danska eller engelska, svara alltid på svenska
- Använd endast svenska ord och termer
- Ignorera språket i fakturan - analysera innehållet men svara på svenska
- Använd svenska valutaformat (kr, öre) och svenska decimaler (komma istället för punkt)

**EXPERTIS:**
- Du förstår skillnaden mellan elöverföring (nätavgift) och elhandel (leverantörsavgift)
- Du kan identifiera vilka avgifter som är obligatoriska vs valfria
- Du förstår att vissa "fasta avgifter" är nätavgifter (obligatoriska) medan andra är leverantörsavgifter (valfria)
- **Kontext är avgörande**: Titta på vilken sektion avgiften tillhör (Elnät vs Elhandel)

**NOGGRANN LÄSNING:**
- Läs av exakt belopp från "Totalt" eller motsvarande kolumn
- Blanda inte ihop olika avgifter med varandra
- Var särskilt uppmärksam på att inte blanda "Årsavgift" med "Elöverföring"
- **DUBBELKOLLA ALLA POSTER**: Gå igenom fakturan rad för rad och leta efter ALLA avgifter som matchar listan nedan
- **VIKTIGT**: Om du hittar en avgift som matchar listan, inkludera den OAVSETT var den står på fakturan
- **EXTRA VIKTIGT**: Leta särskilt efter ord som innehåller "år", "månad", "fast", "rörlig", "påslag" - även om de står i samma rad som andra ord
- **VIKTIGT**: Om du ser en avgift som har både ett årsbelopp (t.ex. "384 kr") och ett månadsbelopp (t.ex. "32,61 kr"), inkludera månadsbeloppet i beräkningen
- **BERÄKNINGSREGEL FÖR Elcertifikat**: Om "Elcertifikat" eller "Elcertifikatavgift" anges i öre/kWh, räkna ut kostnaden som (öre per kWh × total kWh) / 100 = kr, avrunda till två decimaler. Denna post ska ALLTID ingå i onödiga kostnader.
 - **BERÄKNINGSREGEL FÖR Elcertifikat**: Om "Elcertifikat" eller "Elcertifikatavgift" anges i öre/kWh, räkna ut kostnaden som (öre per kWh × total kWh) / 100 = kr, avrunda till två decimaler. Denna post ska ALLTID ingå i onödiga kostnader.

**REGLER FÖR INKLUDERING/EXKLUDERING (MÅSTE FÖLJAS):**
- Räkna ENDAST poster där ett belopp i kr (eller omräknat från öre/kWh) finns i samma tabellrad eller tydligt kopplat till raden.
- Inkludera ENDAST poster under sektionen Elhandel/Elhandelsföretag.
- EXKLUDERA alltid poster under Elnät/Elöverföring (även om de matchar ordlistan).
- "Fast avgift" ska inkluderas om den ligger under Elhandel, och exkluderas om den ligger under Elnät.
- "Profilpris" ska räknas ENDAST under Elhandel och ENDAST om ett kr‑belopp framgår.
- Hoppa över rubriker, diagram och etiketter utan belopp (t.ex. ursprungsmärkning utan kr‑belopp).

**SYFTE:**
Analysera fakturan, leta efter poster som avviker från normala eller nödvändiga avgifter, och förklara dessa poster i ett enkelt och begripligt språk. Ge tips på hur användaren kan undvika dessa kostnader i framtiden eller byta till ett mer förmånligt elavtal.

**VIKTIGT: Efter att du har identifierat alla extra avgifter, summera ALLA belopp och visa den totala besparingen som kunden kan göra genom att byta till ett avtal utan dessa extra kostnader.**

**SÄRSKILT VIKTIGT - LETA EFTER:**
- Alla avgifter som innehåller "år" eller "månad" (t.ex. "årsavgift", "månadsavgift")
- Alla "fasta" eller "rörliga" kostnader
- Alla "påslag" av något slag
- **SÄRSKILT**: Leta efter "Elavtal årsavgift" eller liknande text som innehåller både "elavtal" och "årsavgift"
- **EXTRA VIKTIGT**: Leta särskilt efter "Rörliga kostnader" eller "Rörlig kostnad" - detta är en vanlig extra avgift som ofta missas
- **SÄRSKILT**: Leta efter "Elcertifikat" eller "Elcertifikatavgift" och inkludera den enligt beräkningsregeln ovan
- Gå igenom VARJE rad på fakturan och kontrollera om den innehåller någon av dessa avgifter
- **KRITISKT**: Om du ser "Fast avgift" under sektionen Elhandel/Elhandelsföretag – inkludera den alltid i onödiga kostnader. Om "Fast avgift" även förekommer under Elnät/Elöverföring ska den EXKLUDERAS. Inkludera endast den under Elhandel.

**ORDLISTA - ALLA DETTA RÄKNAS SOM ONÖDIGA KOSTNADER:**
- Månadsavgift, Fast månadsavgift, Fast månadsavg., Månadsavg.
- Rörliga kostnader, Rörlig kostnad, Rörliga avgifter, Rörlig avgift
- Fast påslag, Fasta påslag, Fast avgift, Fast avg., Fasta avgifter, Fast kostnad, Fasta kostnader, Påslag
- Fast påslag spot, Fast påslag elcertifikat
- Årsavgift, Årsavg., Årskostnad, Elavtal årsavgift, Årsavgift elavtal (endast om under Elhandel/leverantörsavgift; exkludera om under Elnät/Elöverföring)
- Förvaltat Portfölj Utfall, Förvaltat portfölj utfall
- Bra miljöval, Bra miljöval (Licens Elklart AB)
- Trygg, Trygghetspaket
- Basavgift, Grundavgift, Administrationsavgift, Abonnemangsavgift, Grundpris
- Fakturaavgift, Kundavgift, Elhandelsavgift, Handelsavgift
- Indexavgift, Elcertifikatavgift, Elcertifikat
- Grön elavgift, Ursprungsgarantiavgift, Ursprung
- Miljöpaket, Serviceavgift, Leverantörsavgift
- Dröjsmålsränta, Påminnelsesavgift, Priskollen
- Rent vatten, Fossilfri, Fossilfri ingår
- Profilpris

**ORDLISTA - KOSTNADER SOM INTE RÄKNAS SOM EXTRA:**
- Moms, Elöverföring, Energiskatt, Medel spotpris, Spotpris, Elpris
- Förbrukning, kWh, Öre/kWh, Kr/kWh

**VIKTIGT: Inkludera ALLA kostnader från första listan i summeringen av onödiga kostnader. Exkludera kostnader från andra listan.**

**SUMMERING:**
1. Lista ALLA hittade onödiga kostnader med belopp
2. Summera ALLA belopp till en total besparing
3. Visa den totala besparingen tydligt i slutet

**MASKINLÄSBAR UTDATA (OBLIGATORISK):**
Efter din textanalys, inkludera ALLTID en JSON‑struktur i ett kodblock med \`\`\`json ... \`\`\` enligt exakt format:
\`\`\`json
{
  "items": [
    { "name": "Fast avgift", "amountKr": 39.20, "section": "Elhandel", "included": true }
  ],
  "totalIncludedKr": 39.20
}
\`\`\`
Regler: Sätt "included" till true endast om posten ska räknas enligt reglerna ovan. Skriv belopp i kronor med punkt som decimaltecken.

**VIKTIGT - SLUTTEXT:**
Efter summeringen, avsluta alltid med denna exakta text:

"För att minska dessa kostnader bör du byta till ett elavtal utan fasta påslag och avgifter.

Rörligt pris – kampanj utan bindningstid som gäller i ett helt år, helt utan påslag eller avgifter.

Önskar du istället säkra ditt elpris med ett fast avtal, rekommenderar vi ett fastprisavtal med prisgaranti. Du bestämmer själv hur lång tid du vill säkra ditt elpris."

Svara på svenska och var hjälpsam och pedagogisk.`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    // Skicka bild + prompt till OpenAI Vision (gpt-4-vision-preview)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Vad betalar jag i onödiga kostnader? Analysera denna elräkning enligt instruktionerna. SVARA ENDAST PÅ SVENSKA - oavsett vilket språk fakturan är på.' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.1,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI Vision error', details: err }, { status: 500 });
    }

    const gptData = await openaiRes.json();
    let gptAnswer = gptData.choices?.[0]?.message?.content || '';

    // Server-side verifiering: försök extrahera JSON-blocket och räkna om totalen
    interface ParsedItem {
      name?: string;
      amountKr?: number;
      section?: string;
      included?: boolean;
    }
    try {
      const jsonBlockMatch = gptAnswer.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        const parsed = JSON.parse(jsonBlockMatch[1]) as { items?: ParsedItem[]; totalIncludedKr?: number };
        const items: ParsedItem[] = Array.isArray(parsed.items) ? parsed.items : [];
        const includedSum = items
          .filter((it) => Boolean(it) && it.included === true && typeof it.amountKr === 'number')
          .reduce((acc: number, it) => acc + (it.amountKr as number), 0);

        // Om totalIncludedKr saknas eller avviker mer än 0.01, lägg till en korrigerad summering i slutet
        const reported = typeof parsed.totalIncludedKr === 'number' ? parsed.totalIncludedKr : null;
        if (reported === null || Math.abs(includedSum - reported) > 0.01) {
          const corrected = {
            items,
            totalIncludedKr: Math.round(includedSum * 100) / 100
          };
          gptAnswer += `\n\nKorrigerad summering (server-beräknad):\n\n\`\`\`json\n${JSON.stringify(corrected, null, 2)}\n\`\`\``.replace(/`/g, '`');
        }
      }
    } catch {}

    // Försök logga analysen i Supabase
    let logId: number | null = null;
    try {
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const sessionId = req.headers.get('x-session-id') || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const { data: insertData, error } = await supabase
          .from('invoice_ocr')
          .insert([
            {
              session_id: sessionId,
              user_agent: userAgent,
              file_mime: mimeType,
              file_size: fileSize,
              image_sha256: imageSha256,
              model: 'gpt-4o',
              system_prompt_version: '2025-01-vision-v1',
              gpt_answer: gptAnswer,
              consent: consent,
            }
          ])
          .select('id')
          .single();

        if (!error && insertData) {
          logId = insertData.id as number;
          // Om samtycke: ladda upp filen till privat bucket och spara referensen
          if (consent) {
            try {
              const bucketName = 'invoice-ocr';
              // Ensure the storage bucket exists (create if missing)
              try {
                const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucketName);
                if (getBucketError || !existingBucket) {
                  await supabase.storage.createBucket(bucketName, {
                    public: false,
                    fileSizeLimit: 20 * 1024 * 1024, // 20 MB
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
                  });
                }
              } catch {
                try {
                  await supabase.storage.createBucket(bucketName, {
                    public: false,
                    fileSizeLimit: 20 * 1024 * 1024,
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
                  });
                } catch {}
              }
              const storageKey = `${logId}/${imageSha256}.${mimeType === 'image/png' ? 'png' : 'jpg'}`;
              const uploadRes = await supabase.storage.from(bucketName).upload(storageKey, buffer, {
                contentType: mimeType,
                upsert: false,
              });
              if (!uploadRes.error) {
                await supabase.from('invoice_ocr_files').insert([
                  {
                    invoice_ocr_id: logId,
                    storage_key: storageKey,
                    image_sha256: imageSha256,
                  }
                ]);
              }
            } catch (e) {
              console.error('Failed to upload invoice image to storage:', e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to log invoice OCR to Supabase:', e);
    }

    return NextResponse.json({ gptAnswer, logId });
  } catch (err) {
    console.error('Unexpected error in /api/gpt-ocr:', err);
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 });
  }
} 