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

**SYFTE:**
Analysera fakturan, leta efter poster som avviker från normala eller nödvändiga avgifter, och förklara dessa poster i ett enkelt och begripligt språk. Ge tips på hur användaren kan undvika dessa kostnader i framtiden eller byta till ett mer förmånligt elavtal.

**VIKTIGT: Efter att du har identifierat alla extra avgifter, summera ALLA belopp och visa den totala besparingen som kunden kan göra genom att byta till ett avtal utan dessa extra kostnader.**

**ORDLISTA - ALLA DETTA RÄKNAS SOM ONÖDIGA KOSTNADER:**
- Månadsavgift, Fast månadsavgift, Fast månadsavg., Månadsavg.
- Rörliga kostnader, Rörlig kostnad, Rörliga avgifter, Rörlig avgift
- Fast påslag, Fasta påslag, Fast avgift, Fasta avgifter, Påslag
- Fast påslag spot, Fast påslag elcertifikat
- Årsavgift, Årsavg., Årskostnad, Elavtal årsavgift, Årsavgift elavtal (endast om under Elhandel/leverantörsavgift; exkludera om under Elnät/Elöverföring)
- Förvaltat Portfölj Utfall, Förvaltat portfölj utfall
- Bra miljöval, Bra miljöval (Licens Elklart AB)
- Trygg, Trygghetspaket
- Basavgift, Grundavgift, Administrationsavgift
- Fakturaavgift, Kundavgift, Elhandelsavgift, Handelsavgift
- Indexavgift, Elcertifikatavgift, Elcertifikat
- Grön elavgift, Ursprungsgarantiavgift, Ursprung
- Miljöpaket, Serviceavgift, Leverantörsavgift
- Dröjsmålsränta, Påminnelsesavgift, Priskollen
- Rent vatten, Fossilfri, Fossilfri ingår

**ORDLISTA - KOSTNADER SOM INTE RÄKNAS SOM EXTRA:**
- Moms, Elöverföring, Energiskatt, Medel spotpris, Spotpris, Elpris
- Förbrukning, kWh, Öre/kWh, Kr/kWh

**VIKTIGT: Inkludera ALLA kostnader från första listan i summeringen av onödiga kostnader. Exkludera kostnader från andra listan.**

**SUMMERING:**
1. Lista ALLA hittade onödiga kostnader med belopp
2. Summera ALLA belopp till en total besparing
3. Visa den totala besparingen tydligt i slutet

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
              { type: 'text', text: 'Vad betalar jag i onödiga kostnader? Analysera denna elräkning enligt instruktionerna.' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI Vision error', details: err }, { status: 500 });
    }

    const gptData = await openaiRes.json();
    const gptAnswer = gptData.choices?.[0]?.message?.content || '';

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