import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_OCR_MODEL = process.env.XAI_OCR_MODEL || 'grok-4.3';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[]);
  }
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Läs filen och konvertera till base64 utan Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const base64Image = `data:${mimeType};base64,${arrayBufferToBase64(arrayBuffer)}`;

    const xaiApiKey = process.env.XAI_API_KEY;
    if (!xaiApiKey) {
      return NextResponse.json({ error: 'Missing XAI API key' }, { status: 500 });
    }

    // Step 1: Extract structured data
    const extractionPrompt = `Du er en ekspert i danske elregninger. Din opgave er at udtrække ALLE omkostninger fra fakturaen og strukturere dem i JSON-format.

**VIGTIGT - SPROG:**
- Du SKAL altid svare på dansk, uanset hvilket sprog fakturaen er på
- Brug kun danske ord og termer

**EXTRAKTIONSREGEL:**
Udtræk ALLE omkostninger fra fakturaen og returnér dem som en JSON-array. Hver omkostning skal have:
- "name": præcis tekst fra fakturaen (fx "Abonnement", "Aftale årsgebyr")
- "amount": beløb i kr (fx 31.20, 44.84)
- "section": hvilken sektion den tilhører ("Net", "Elnät", "Elhandel", "Leverandør", "Abonnement")
- "description": kort beskrivelse af omkostningen

**EXEMPEL JSON:**
[
  {
    "name": "Fast månadsavgift",
    "amount": 31.20,
    "section": "Elhandel",
    "description": "Månatlig fast avgift från elleverantören"
  },
  {
    "name": "Elavtal årsavgift",
    "amount": 44.84,
    "section": "Elhandel", 
    "description": "Årsavgift för elavtalet"
  },
  {
    "name": "Elöverföring",
    "amount": 217.13,
    "section": "Elnät",
    "description": "Nätavgift för elöverföring"
  }
]

**VIGTIGT:**
- Inkludér ALLE omkostninger, også dem der ikke er "unødige"
- Læs præcist beløb fra "Total/Totalt/I alt" eller sidste beløbskolonne
- Vær ekstra opmærksom på danske termer: "Abonnement", "Aftalegebyr", "Aftale årsgebyr", "Handelstillæg", "Spot-tillæg"
- Hvis en post har både års- og månedsbeløb, brug månedsbeløbet i "amount"

Svara ENDAST med JSON-arrayen, inget annat.`;

    const extractionRes = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify({
        model: XAI_OCR_MODEL,
        messages: [
          { role: 'system', content: extractionPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extrahera alla kostnader från denna elräkning som JSON-array. SVARA ENDAST MED JSON.' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.0,
      }),
    });

    const debugInfo: {
      step1_success: boolean;
      extractedJson: string;
      parsedData: unknown;
      parseError: string | null;
      elavtalFound: boolean;
      elavtalAmount: number | null;
      regexMatch: RegExpMatchArray | null;
    } = {
      step1_success: false,
      extractedJson: '',
      parsedData: null,
      parseError: null,
      elavtalFound: false,
      elavtalAmount: null,
      regexMatch: null
    };

    if (extractionRes.ok) {
      const extractionData = await extractionRes.json();
      const extractedJson = extractionData.choices?.[0]?.message?.content || '';
      debugInfo.step1_success = true;
      debugInfo.extractedJson = extractedJson;
      
      // Try to parse the JSON
      try {
        const parsedData = JSON.parse(extractedJson);
        debugInfo.parsedData = parsedData;
        
        // Check if annual fee line is in the data (SE/DK aliases)
        const elavtalItem = parsedData.find((item: { name?: string }) => 
          item.name && /(elavtal årsavgift|aftale årsgebyr|årsabonnement|årsgebyr)/i.test(item.name)
        );
        
        if (elavtalItem) {
          debugInfo.elavtalFound = true;
          debugInfo.elavtalAmount = elavtalItem.amount;
        }
        
        // Test regex pattern
        const elavtalMatch = extractedJson.match(
          /["']?(Elavtal årsavgift|Aftale årsgebyr|Årsabonnement|Årsgebyr)["']?\s*[,\]]\s*["']?(\d+(?:[,.]\d+)?)["']?\s*kr/i
        );
        debugInfo.regexMatch = elavtalMatch;
        
      } catch (parseError) {
        debugInfo.parseError = String(parseError);
      }
    }

    return NextResponse.json({
      debug: debugInfo,
      message: 'Debug information for invoice analysis'
    });

  } catch (err) {
    console.error('Debug error:', err);
    return NextResponse.json({ error: 'Debug failed', details: String(err) }, { status: 500 });
  }
}
