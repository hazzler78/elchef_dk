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
    const systemPrompt = `Du är en expert på att analysera elräkningar. Din uppgift är att analysera den uppladdade elräkningen och identifiera onödiga kostnader.

Svara ALLTID på svenska, även om du inte kan analysera fakturan.

**VIKTIGT FÖR BERÄKNINGAR:**
- Använd exakt matematik, avrunda till 2 decimaler
- Rörliga kostnader = Elförbrukning × Rörliga kostnader (öre/kWh) ÷ 100
- Fast påslag = Elförbrukning × Fast påslag (öre/kWh) ÷ 100
- Elavtal årsavgift (månadsbasis) = Årsavgift ÷ 12
- Totala extra avgifter = Rörliga kostnader + Fast påslag + Elavtal årsavgift (månadsbasis)
- Möjlig årlig besparing = Möjlig besparing per månad × 12

**VIKTIGT: Visa ENDAST slutresultaten, INTE matematiska formler eller uträkningar.**

**IDENTIFIERA DETTA SOM EXTRA AVGIFTER:**

💸 **Påslag & marginaler**
- Rörligt påslag, rörliga kostnader, rörlig avgift
- Fast påslag, fast avgift, fast kostnad
- Prispåslag, fasta och rörliga påslag
- Marginal, vinstpåslag, energipåslag
- Elpåslag, elkostnad, elavgift

📆 **Periodiska avgifter**
- Månadsavgift, årsavgift, basavgift
- Grundavgift, fast avgift, administrationsavgift
- Administrationsavgift, adminavgift

🧾 **Administrativa avgifter**
- Fakturaavgift, faktureringsavgift
- Kundavgift, kundserviceavgift

📈 **Handelsrelaterade avgifter**
- Elhandelsavgift, energihandelsavgift
- Handelsavgift, spotpris, spotkostnad
- Indexavgift, referensavgift

🌱 **Miljö, certifikat och garanti**
- Elcertifikat, elcertifikatavgift, miljöavgift
- Grön elavgift, garantiavgift
- Ursprungsgarantiavgift

📦 **Övriga tillägg och paket**
- Trygghetspaket, miljöpaket, tilläggspaket
- Serviceavgift, tilläggsavgift
- Leverantörsavgift, extraavgift, extrakostnad

🔍 **Avgifter med misstänkt språk**
- Dold avgift, dolda avgifter, gömda avgifter
- Bakade avgifter, ospecificerade påslag
- Tysta avgifter, mikroavgifter
- Små avgifter, överflödig avgift
- Onödig avgift, skrymmande avgift
- Nästan osynliga avgifter

**VIKTIGT: Alla ovanstående avgifter ska räknas som extra kostnader utöver medelspotpriset.**

Analysera fakturan och presentera resultatet i följande format:

## 📊 Analys av din elräkning

### 🔍 Elförbrukning och kostnader
- **Elförbrukning:** [X] kWh
- **Medelspotpris:** [X] öre/kWh
- **Rörliga kostnader:** [X] öre/kWh
- **Fast påslag:** [X] öre/kWh
- **Elavtal årsavgift:** [X] kr för [X] dagar

### 💰 Totala kostnader
- **Elöverföring:** [X] kr
- **Energiskatt:** [X] kr
- **[Leverantör]:** [X] kr
- **Totalt belopp att betala:** [X] kr

### ⚠️ Analys av onödiga kostnader
**Rörliga kostnader och fast påslag:** Dessa kan ses som extra avgifter utöver medelspotpriset. Totalt blir det:
- Rörliga kostnader: [X] kr
- Fast påslag: [X] kr
- Elavtal årsavgift (månadsbasis): [X] kr/månad

### 💡 Möjlig besparing
- **Totala extra avgifter:** [X] kr
- **Möjlig besparing per månad:** [X] kr
- **Möjlig årlig besparing:** [X] kr

### 🎯 Slutsats
**Detta är summan du har i el:** [X] kr (medelspotpris)

**Detta är summan du har i extraavgifter:** [X] kr

**Vid byte till ett avtal utan extraavgifter skulle du med denna fakturan sparat:** [X] kr

### 💬 Rekommendation
För att minska dina kostnader kan du överväga att byta till ett avtal utan extra avgifter. Du kan använda tjänster som Elchef.se för att hitta bättre alternativ.

Använd dessa referenspriser 2025 (öre/kWh):
Januari: Elområde 1=23,8, Elområde 2=24,3, Elområde 3=63,4, Elområde 4=76,1
Februari: Elområde 1=12,9, Elområde 2=14,5, Elområde 3=77,0, Elområde 4=103,9
Mars: Elområde 1=15,8, Elområde 2=10,9, Elområde 3=50,8, Elområde 4=60,5
April: Elområde 1=14,4, Elområde 2=14,2, Elområde 3=37,6, Elområde 4=58,3
Maj: Elområde 1=14,1, Elområde 2=15,1, Elområde 3=42,9, Elområde 4=60,0
Juni: Elområde 1=3,0, Elområde 2=5,0, Elområde 3=22,8, Elområde 4=40,7`;

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