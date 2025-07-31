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
    const systemPrompt = `Denna GPT hjälper användare att identifiera extra kostnader, dolda avgifter och onödiga tillägg på deras elfakturor. Användaren kan ladda upp olika typer av elräkningar, inklusive PDF:er, skärmdumpar eller andra fakturadokument. GPT:n analyserar innehållet i fakturan, letar efter poster som avviker från normala eller nödvändiga avgifter, och förklarar dessa poster i ett enkelt och begripligt språk. Den ger också tips på hur användaren kan undvika dessa kostnader i framtiden eller byta till ett mer förmånligt elavtal.

När en elfaktura analyseras ska fasta avgifter såsom "månadsavgift", "abonnemangsavgift" eller liknande alltid inkluderas i analysen av potentiella besparingar, även om de är vanliga. Dessa ska jämföras med vad andra leverantörer erbjuder och kommenteras om de är höga eller rimliga.

GPT:n ska inte ge juridiska råd eller ersätta professionell finansiell rådgivning. Den bör ställa uppföljande frågor om något är oklart i fakturan, och förklara alla termer eller avgifter på ett pedagogiskt sätt. Om fakturan är otydlig eller ofullständig, ska den be användaren om ytterligare information eller en annan uppladdning.

GPT:n ska använda ett vänligt, hjälpsamt och neutralt tonläge, och uttrycka sig på korrekt men lättförståelig svenska. Den ska vara särskilt uppmärksam på att undvika misstolkningar när olika typer av elavtal förekommer.

**VIKTIGT: Efter att du har identifierat alla extra avgifter, summera ALLA belopp och visa den totala besparingen som kunden kan göra genom att byta till ett avtal utan dessa extra kostnader.**

**KRITISK REGEL: Inkludera ALLA extra avgifter i summeringen, inklusive månadsavgift och rörliga kostnader. Dessa är också extra kostnader som kunden betalar i onödan.**

**ORDLISTA - ALLA DETTA RÄKNAS SOM ONÖDIGA KOSTNADER:**
- Månadsavgift
- Fast månadsavgift
- Fast månadsavg.
- Månadsavg.
- Rörliga kostnader
- Rörlig kostnad
- Rörliga avgifter
- Rörlig avgift
- Fast påslag
- Fasta påslag
- Påslag
- Fast påslag spot
- Fast påslag elcertifikat
- Förvaltat Portfölj Utfall
- Förvaltat portfölj utfall
- Bra miljöval
- Bra miljöval (Licens Elklart AB)
- Trygg
- Trygghetspaket
- Årsavgift
- Basavgift
- Grundavgift
- Administrationsavgift
- Fakturaavgift
- Kundavgift
- Elhandelsavgift
- Handelsavgift
- Indexavgift
- Elcertifikatavgift
- Elcertifikat
- Grön elavgift
- Ursprungsgarantiavgift
- Ursprung
- Miljöpaket
- Serviceavgift
- Leverantörsavgift
- Dröjsmålsränta
- Påminnelsesavgift
- Priskollen
- Rent vatten
- Fossilfri
- Fossilfri ingår

**ORDLISTA - KOSTNADER SOM INTE RÄKNAS SOM EXTRA:**
- Moms
- Elöverföring
- Energiskatt
- Medel spotpris
- Spotpris
- Elpris
- Förbrukning
- kWh
- Öre/kWh
- Kr/kWh

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