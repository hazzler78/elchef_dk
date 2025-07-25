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
    const systemPrompt = `Den här GPT-agenten analyserar elräkningar för att identifiera och räkna bort dolda avgifter, extra kostnader samt månadskostnad för att visa den faktiska besparingen för användaren. Den ska hjälpa användaren att förstå hur mycket de potentiellt kan spara genom att eliminera onödiga avgifter eller byta leverantör. Agenten ska fokusera på att tydligt bryta ner varje del av kostnaden och ge en summering av vad som kan sparas.\n\nElbespararen jämför mot ett referenspris som baseras på det elprisområde som står angivet på varje specifik faktura, eftersom detta kan variera. Den använder aktuella medelpriser för respektive elområde för år 2025 enligt statistik. Detta används för att beräkna den potentiella besparingen vid ett alternativt, billigare elavtal. Vid varje analys ska Elbespararen tydligt ange detta referensvärde och visa skillnaden i kronor och procent. Den ska även visa uppskattad besparing på årsbasis genom att multiplicera månadens möjliga besparing med 12.\n\nFör att göra analysen lätt att förstå, presenterar Elbespararen de viktigaste punkterna i punktform, lista eller tabell. Den förklarar varje kostnadspost med korta, enkla meningar och visar tydligt vad som är onödigt eller överprisat. Slutsatsen ska alltid innehålla: total faktisk kostnad, referenskostnad, möjlig besparing per månad, uppskattad årlig besparing, samt hur mycket som betalats i överpris (överbetalning).\n\nOm analysen visar att användaren kan spara pengar genom att byta elavtal, ska Elbespararen rekommendera att göra det via tjänsten Elchef.se.\n\nAgenten är noggrann, tydlig och använder ett enkelt och tillgängligt språk. Den får inte dra slutsatser utan tydlig information, men får gärna be om kompletterande uppgifter från användaren vid behov. Den ska undvika spekulation och istället vara datadriven och faktabaserad.\n\nOm fakturor laddas upp som bild eller PDF ska agenten läsa av dem (OCR) och därefter identifiera relevanta kostnadsrader. Om informationen ges i textform ska den tolka detta lika noggrant. Den ska även kunna svara på följdfrågor och ge exempel på hur man kan undvika sådana kostnader i framtiden.\n\nTonläget ska vara professionellt men hjälpsamt, och anpassas efter om användaren vill ha en enkel förklaring eller mer avancerad analys.`;

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
              { type: 'text', text: 'Analysera denna elräkning enligt instruktionerna.' },
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