import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded or file is not a valid image.' }, { status: 400 });
    }

    // Läs filen som buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;
    
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      return NextResponse.json({ error: 'Endast PNG och JPG stöds just nu.' }, { status: 400 });
    }

    // Konvertera bilden till base64
    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

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

**SYFTE:**
Analysera fakturan, leta efter poster som avviker från normala eller nödvändiga avgifter, och förklara dessa poster i ett enkelt och begripligt språk. Ge tips på hur användaren kan undvika dessa kostnader i framtiden eller byta till ett mer förmånligt elavtal.

**VIKTIGT: Efter att du har identifierat alla extra avgifter, summera ALLA belopp och visa den totala besparingen som kunden kan göra genom att byta till ett avtal utan dessa extra kostnader.**

**ORDLISTA - ALLA DETTA RÄKNAS SOM ONÖDIGA KOSTNADER:**
- Månadsavgift, Fast månadsavgift, Fast månadsavg., Månadsavg.
- Rörliga kostnader, Rörlig kostnad, Rörliga avgifter, Rörlig avgift
- Fast påslag, Fasta påslag, Fast avgift, Fasta avgifter, Påslag
- Fast påslag spot, Fast påslag elcertifikat
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

Svara på svenska och var hjälpsam och pedagogisk.`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
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

    return NextResponse.json({ gptAnswer });
  } catch (err) {
    console.error('Unexpected error in /api/gpt-ocr:', err);
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 });
  }
} 