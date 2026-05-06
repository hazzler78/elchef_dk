import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'edge';
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_OCR_MODEL = process.env.XAI_OCR_MODEL || 'grok-4.3';
const INVOICE_MARKET = 'DK';

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[]);
  }
  // btoa is available in Edge runtime
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const consentRaw = formData.get('consent');
    const consent = typeof consentRaw === 'string' ? consentRaw === 'true' : false;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded or file is not a valid image.' }, { status: 400 });
    }

    // Läs filen som ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const fileSize = (file as File).size;
    
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      return NextResponse.json({ error: 'Kun PNG og JPG understøttes lige nu.' }, { status: 400 });
    }

    // Konvertera bilden till base64 (utan Buffer)
    const base64Image = `data:${mimeType};base64,${arrayBufferToBase64(arrayBuffer)}`;
    const imageSha256 = await sha256Hex(arrayBuffer);

    // Step 1: Extract structured data from invoice
    const extractionPrompt = `Du är en expert på danske elregninger fra ALLE elleverandører. Din opgave er at udtrække ALLE omkostninger fra fakturaen og strukturere dem i JSON-format.

VIKTIGT - FLEXIBILITET:
- Du SKAL kunne håndtere danske fakturaer fra alle elleverandører (fx Andel Energi, OK, Norlys, Ewii, Nettopower, Velkommen, Modstrøm, b.energy, Kärnfull m.fl.)
- Fakturaer har forskellig layout og terminologi - tilpas dig hver faktura
- Du SKAL altid svare på dansk, uanset hvilket sprog fakturaen er på
- Brug kun danske ord og termer

EXTRAKTIONSREGEL:
Extrahera ALLA kostnader från fakturan och returnera dem som en JSON-array. Varje kostnad ska ha:
- "name": exakt text från fakturan (t.ex. "Fast månadsavgift", "Elavtal årsavgift")
- "amount": belopp i kr från "Totalt"-kolumnen (t.ex. 31.20, 44.84) - INTE från "öre/kWh" eller "kr/mån"
- "section": hvilken sektion den tilhører ("Net", "Elnät", "Elhandel", "Leverandør", "Abonnement")
- "description": kort beskrivning av vad kostnaden är

KRITISKT FÖR BELOPP:
- Läs ALLTID från den sista kolumnen som innehåller slutbeloppet i kr
- Ignorera kolumner med "öre/kWh", "kr/mån", "kr/kWh" - dessa är bara pris per enhet
- Slutbeloppet är det som faktiskt debiteras kunden

EXEMPEL JSON:
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
  },
  {
    "name": "Påslag",
    "amount": 13.80,
    "section": "Elhandel",
    "description": "Påslag på elpriset (läs från Totalt-kolumnen, inte från öre/kWh)"
  }
]

VIKTIGT - FLEXIBELT FÖR ALLA LEVERANTÖRER:
- Inkludera ALLA kostnader, även de som inte är "onödiga"
- KRITISKT: Läs ALLTID beloppet från "Totalt"-kolumnen eller den sista kolumnen med belopp
- Läs INTE från "öre/kWh" eller "kr/mån" kolumner - bara slutbeloppet
- KRITISKT: Leta särskilt efter "Elavtal årsavgift" - denna kostnad missas ofta men är viktig
- Var särskilt uppmärksam på "Fast månadsavgift", "Profilpris", "Rörliga kostnader", "Fast påslag", "Påslag"
- Om en kostnad har både års- och månadsbelopp, inkludera månadsbeloppet
- EXTRA VIKTIGT: "Elavtal årsavgift" kan stå som en egen rad eller som del av en längre text - leta efter den överallt
- BELOPPSLÄSNING: För "Påslag" - läs det exakta beloppet som står i "Totalt"-kolumnen, inte från beräkningen

LEVERANTÖRSSPECIFIKA TERMER:
- E.ON: "Elavtal årsavgift", "Fast påslag", "Rörliga kostnader"
- Fortum: "Månadsavgift", "Påslag", "Elcertifikat"
- Vattenfall: "Fast avgift", "Påslag", "Årsavgift"
- EDF: "Abonnemangsavgift", "Påslag", "Serviceavgift"
- Göteborg Energi: "Månadsavgift", "Påslag", "Elcertifikat"
- Stockholm Exergi: "Fast avgift", "Påslag", "Årsavgift"
- DANSKE TERMER (meget vigtige):
- "Abonnement", "Abonnementspris", "Abonnementsgebyr", "Månedligt abonnement", "Aftalegebyr", "Aftale årsgebyr", "Administrationsgebyr"
- "Tillæg", "Spot-tillæg", "Handelstillæg", "Påslag", "Variabelt tillæg", "Fast tillæg", "Balancetarif"
- "Nettarif", "Systemtarif", "Transport", "Tarif", "Netabonnement", "Netydelse", "Abonnement til netselskab"
- "Elafgift", "Moms", "Systemydelse", "PSO", "Elleverance", "Abonnementsbidrag"
- "KWh-pris", "Energi", "Forbrug", "A conto", "Modregning", "Rabat", "Kampagnerabat"
- Andra leverantörer: Anpassa efter fakturans terminologi

JSON-FORMAT KRITISKT:
- Använd endast dubbla citattecken för strängar
- Inga trailing commas
- Inga kommentarer i JSON
- Perfekt formatering krävs
- Starta direkt med [ och sluta med ]

SLUTLIG PÅMINNELSE:
- Läs belopp från "Totalt"-kolumnen, INTE från "öre/kWh" eller "kr/mån"
- För "Månadsavgift": läs från "Totalt"-kolumnen (t.ex. 55,20 kr), inte från "kr/mån"-kolumnen
- För "Påslag": läs från "Totalt"-kolumnen (t.ex. 13,80 kr), inte från "öre/kWh"-kolumnen

KRITISKT EXEMPEL FÖR FORTUM-FAKTUROR:
På Fortum-fakturor ser du ofta:
- "Påslag: 690 kWh at 2,00 öre/kWh, totaling 13,80 kr"
- Läs ALLTID "13,80 kr" (slutbeloppet), INTE "2,00 öre/kWh" (enhetspriset)
- Samma gäller för "Månadsavgift: 1 Mån at 55,20 kr/mån, totaling 55,20 kr"
- Läs ALLTID "55,20 kr" (slutbeloppet), INTE "55,20 kr/mån" (enhetspriset)

VIKTIGT - FÖR ALLA LEVERANTÖRER:
- Leta efter ordet "totaling" eller "totalt" följt av beloppet i kr
- Ignorera alltid siffror följda av "öre/kWh", "kr/mån", "kr/kWh"
- Slutbeloppet är det som faktiskt debiteras kunden

EXTRA VIKTIGT FÖR PÅSLAG:
- På alla fakturor: läs från "Totalt"-kolumnen eller sista kolumnen med belopp
- På Fortum-fakturor: "Påslag: 690 kWh at 2,00 öre/kWh, totaling 13,80 kr" - läs "13,80 kr"
- På andra leverantörer: läs från "Totalt"-kolumnen eller sista kolumnen med belopp
- KRITISKT: Läs ALLTID slutbeloppet, INTE enhetspriset (öre/kWh, kr/mån)

Svara ENDAST med JSON-arrayen, inget annat text.`;

    // Step 2: Calculate unnecessary costs from structured data
    const calculationPrompt = `Du är en expert på danske elregninger fra ALLE elleverandører. Baseret på den udtrukne JSON-data skal du identificere unødige omkostninger og beregne samlet besparelse.

ORDLISTA - ONÖDIGA KOSTNADER (endast under Elhandel):
- Månadsavgift, Fast månadsavgift, Fast månadsavg., Månadsavg.
- Rörliga kostnader, Rörlig kostnad, Rörliga avgifter, Rörlig avgift
- Fast påslag, Fasta påslag, Fast avgift, Fast avg., Fasta avgifter, Fast kostnad, Fasta kostnader, Påslag, Påslag (alla varianter)
- Fast påslag spot, Fast påslag elcertifikat
- Årsavgift, Årsavg., Årskostnad, Elavtal årsavgift, Årsavgift elavtal
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
- Profilpris, Bundet profilpris
- DANSKA ALIAS:
- Abonnement, Abonnementspris, Abonnementsgebyr, Aftalegebyr, Aftale årsgebyr, Administrationsgebyr
- Handelstillæg, Spot-tillæg, Variabelt tillæg, Fast tillæg, Balancetarif (når det står under leverandør/elhandel)
- Servicegebyr, Leverandørgebyr, Miljøtillæg, Klima-/grønt tillæg

LEVERANTÖRSSPECIFIKA ONÖDIGA KOSTNADER:
- E.ON: "Elavtal årsavgift", "Fast påslag", "Rörliga kostnader"
- Fortum: "Månadsavgift", "Påslag", "Elcertifikat"
- Vattenfall: "Fast avgift", "Påslag", "Årsavgift"
- EDF: "Abonnemangsavgift", "Påslag", "Serviceavgift"
- Göteborg Energi: "Månadsavgift", "Påslag", "Elcertifikat"
- Stockholm Exergi: "Fast avgift", "Påslag", "Årsavgift"
- Andra leverantörer: Identifiera liknande avgifter och påslag

EXKLUDERA (räknas INTE som onödiga):
- Elöverföring, Energiskatt, Medel spotpris, Spotpris, Elpris
- **OBS**: Moms inkluderas i besparingsberäkningen eftersom konsumenten betalar den verkliga kostnaden inklusive moms
- Bundet elpris, Fastpris (själva energipriset), Rörligt elpris (själva energipriset)
- Förbrukning, kWh, Öre/kWh, Kr/kWh
- DANSKE EXKLUDERINGER:
- Nettarif, Systemtarif, Elafgift, Transport, Netydelse, Tariffer fra netselskab (nødvendige netomkostninger)
- Selve energiprisen per kWh (fx "Spotpris", "Fastpris per kWh", "Energi")

INSTRUKTION:
1. Gå igenom JSON-datan och identifiera alla kostnader som matchar ordlistan OCH är under "Elhandel"
2. Summera alla onödiga kostnader
3. **VIKTIGT**: Inkludera moms (25%) i besparingsberäkningen eftersom konsumenten betalar den verkliga kostnaden inklusive moms
4. Presentera resultatet enligt formatet nedan

FORMAT:
🚨 Dina onödiga elavgifter upptäckta!

Jag har hittat [antal] onödiga avgifter på din elräkning som kostar dig pengar varje månad:

💸 Onödiga kostnader denna månad:
1. [Kostnadsnamn]: [belopp] kr
2. [Kostnadsnamn]: [belopp] kr

💰 Din årliga besparing:
Du betalar [total] kr/månad i onödiga avgifter (inklusive moms) = [total × 12] kr/år!

Detta är pengar som går direkt till din elleverantör utan att du får något extra för dem.

✅ Lösningen:
Byt till ett avtal utan dessa avgifter och spara [total × 12] kr/år (inklusive moms)!

🎯 Välj ditt nya avtal:
- Rörligt avtal: 0 kr i avgifter första året – spara [total × 12] kr/år
- Fastpris med prisgaranti: Prisgaranti med valfri bindningstid

⏰ Byt idag – det tar bara 2 minuter och vi fixar allt åt dig!

Svar på dansk og vær hjælpsom og pædagogisk.`; // Updated fastpris text

    // Original single-step prompt (fallback)
    const systemPrompt = `Du är en expert på danske elregninger som hjælper brugere med at identificere ekstra omkostninger, skjulte gebyrer og unødige tillæg på deres elfakturaer. 

VIKTIGT - SPRÅK:
- Du SKAL altid svare på dansk, uanset hvilket sprog fakturaen er på
- Selv om fakturaen er på svensk, norsk, dansk eller engelsk, skal du svare på dansk
- Brug kun danske ord og termer
- Ignorera språket i fakturan - analysera innehållet men svara på dansk
- Brug dansk valutaformat (kr, øre) og danske decimaler (komma i løbende tekst er ok)

EXPERTIS:
- Du förstår skillnaden mellan elöverföring (nätavgift) och elhandel (leverantörsavgift)
- Du kan identifiera vilka avgifter som är obligatoriska vs valfria
- Du förstår att vissa "fasta avgifter" är nätavgifter (obligatoriska) medan andra är leverantörsavgifter (valfria)
- Kontext är avgörande: Titta på vilken sektion avgiften tillhör (Elnät vs Elhandel)
- Kontext er afgørende: Vurdér altid sektion (Net/Netselskab vs Elhandel/Leverandør)

NOGGRANN LÄSNING:
- Läs av exakt belopp från "Totalt" eller motsvarande kolumn
- Blanda inte ihop olika avgifter med varandra
- Var särskilt uppmärksam på att inte blanda "Årsavgift" med "Elöverföring"
- DUBBELKOLLA ALLA POSTER: Gå igenom fakturan rad för rad och leta efter ALLA avgifter som matchar listan nedan
- VIKTIGT: Om du hittar en avgift som matchar listan, inkludera den OAVSETT var den står på fakturan
- EXTRA VIKTIGT: Leta särskilt efter ord som innehåller "år", "månad", "fast", "rörlig", "påslag" - även om de står i samma rad som andra ord
- VIKTIGT: Om du ser en avgift som har både ett årsbelopp (t.ex. "384 kr") och ett månadsbelopp (t.ex. "32,61 kr"), inkludera månadsbeloppet i beräkningen
- BERÄKNINGSREGEL FÖR Elcertifikat: Om "Elcertifikat" eller "Elcertifikatavgift" anges i öre/kWh, räkna ut kostnaden som (öre per kWh × total kWh) / 100 = kr, avrunda till två decimaler. Denna post ska ALLTID ingå i onödiga kostnader.

SYFTE:
Analysera fakturan, leta efter poster som avviker från normala eller nödvändiga avgifter, och förklara dessa poster i ett enkelt och begripligt språk. Ge tips på hur användaren kan undvika dessa kostnader i framtiden eller byta till ett mer förmånligt elavtal.

VIKTIGT: Efter att du har identifierat alla extra avgifter, summera ALLA belopp och visa den totala besparingen som kunden kan göra genom att byta till ett avtal utan dessa extra kostnader.

SÄRSKILT VIKTIGT - LETA EFTER:
- Alla avgifter som innehåller "år" eller "månad" (t.ex. "årsavgift", "månadsavgift")
- Alla "fasta" eller "rörliga" kostnader
- Alla "påslag" av något slag
- SÄRSKILT: Leta efter "Elavtal årsavgift" eller liknande text som innehåller både "elavtal" och "årsavgift"
- EXTRA VIKTIGT: "Elavtal årsavgift" är en vanlig extra avgift som ofta missas - leta särskilt efter denna exakta text
- EXTRA VIKTIGT: Leta särskilt efter "Rörliga kostnader" eller "Rörlig kostnad" - detta är en vanlig extra avgift som ofta missas
- SÄRSKILT: Leta efter "Elcertifikat" eller "Elcertifikatavgift" och inkludera den enligt beräkningsregeln ovan
- Gå igenom VARJE rad på fakturan och kontrollera om den innehåller någon av dessa avgifter
- KRITISKT: Om du ser "Fast avgift" under sektionen Elhandel/Elhandelsföretag – inkludera den alltid i onödiga kostnader. Om "Fast avgift" även förekommer under Elnät/Elöverföring ska den EXKLUDERAS. Inkludera endast den under Elhandel.
 - KRITISKT: Om du ser "Profilpris" eller "Bundet profilpris" som en EGEN radpost under Elhandel – inkludera den i onödiga kostnader. Om det står under Elnät/Elöverföring ska det EXKLUDERAS.
 - VIKTIG FÖRVÄXLINGSREGEL: Blanda inte ihop "Bundet elpris" (själva energipriset per kWh) med "Profilpris". "Bundet elpris", "Elpris", "Fastpris per kWh" och liknande är INTE onödiga kostnader och ska exkluderas. "Profilpris"/"Bundet profilpris" är däremot ett extra påslag och ska inkluderas när det ligger under Elhandel.

ORDLISTA - ALLA DETTA RÄKNAS SOM ONÖDIGA KOSTNADER:
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
 - Profilpris, Bundet profilpris
- DANSKA ALIAS:
- Abonnement, Abonnementspris, Abonnementsgebyr, Aftalegebyr, Aftale årsgebyr, Administrationsgebyr
- Handelstillæg, Spot-tillæg, Variabelt tillæg, Fast tillæg, Servicegebyr, Leverandørgebyr

ORDLISTA - KOSTNADER SOM INTE RÄKNAS SOM EXTRA:
- Moms, Elöverföring, Energiskatt, Medel spotpris, Spotpris, Elpris
- Bundet elpris, Fastpris (själva energipriset), Rörligt elpris (själva energipriset)
- Förbrukning, kWh, Öre/kWh, Kr/kWh
- Nettarif, Systemtarif, Elafgift, Transport, Netydelse (nødvendige netomkostninger)

VIKTIGT: Inkludera ALLA kostnader från första listan i summeringen av onödiga kostnader. Exkludera kostnader från andra listan.

SUMMERING:
1. Lista ALLA hittade onödiga kostnader med belopp
2. Summera ALLA belopp till en total besparing
3. Visa den totala besparingen tydligt i slutet

VIKTIGT - SLUTTEXT:
Efter summeringen, avsluta alltid med denna exakta text:

"💰 Din årliga besparing:
Du betalar [total] kr/månad i onödiga avgifter (inklusive moms) = [total × 12] kr/år!

Detta är pengar som går direkt till din elleverantör utan att du får något extra för dem.

✅ Lösningen:
Byt till ett avtal utan dessa avgifter och spara [total × 12] kr/år (inklusive moms)!

🎯 Välj ditt nya avtal:
- Rörligt avtal: 0 kr i avgifter första året – spara [total × 12] kr/år
- Fastprisavtal: Prisgaranti med valfri bindningstid – spara [total × 12] kr/år

⏰ Byt idag – det tar bara 2 minuter och vi fixar allt åt dig!"

Svar på dansk og vær hjælpsom og pædagogisk.`;

    const xaiApiKey = process.env.XAI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!xaiApiKey) {
      return NextResponse.json({ error: 'Missing XAI API key' }, { status: 500 });
    }

    // Two-step approach: Extract JSON first, then calculate
    let gptAnswer = '';
    
    try {
      // Step 1: Extract structured data
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

      if (extractionRes.ok) {
        const extractionData = await extractionRes.json();
        const extractedJson = extractionData.choices?.[0]?.message?.content || '';
        console.log('Raw extraction response:', extractedJson.substring(0, 200));
        
        // Try to parse the JSON
        try {
          // Clean the JSON response - remove any markdown formatting
          let cleanJson = extractedJson.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          }
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          console.log('Cleaned JSON:', cleanJson.substring(0, 200));
          JSON.parse(cleanJson); // Validate JSON structure
          
          // Step 2: Calculate unnecessary costs from structured data
          const calculationRes = await fetch(XAI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${xaiApiKey}`,
            },
            body: JSON.stringify({
              model: XAI_OCR_MODEL,
              messages: [
                { role: 'system', content: calculationPrompt },
                {
                  role: 'user',
                  content: `Här är den extraherade JSON-datan från elräkningen:\n\n${cleanJson}\n\nAnalysera denna data enligt instruktionerna.`
                }
              ],
              max_tokens: 1200,
              temperature: 0.1,
            }),
          });

          if (calculationRes.ok) {
            const calculationData = await calculationRes.json();
            gptAnswer = calculationData.choices?.[0]?.message?.content || '';
            
        // Step 3: Post-process to catch missed or incorrect amounts
        if (gptAnswer) {
          console.log('Post-processing to verify amounts...');
          console.log('Full GPT Answer for debugging:', gptAnswer);
          console.log('Extracted JSON preview:', cleanJson.substring(0, 500));
              
              // Check for "Påslag" amount correction (match any name that contains Påslag)
              const paaslagMatch = cleanJson.match(
                /"name"\s*:\s*"[^"]*(Påslag|Tillæg|Tillägg|Handelstillæg|Spot-tillæg)[^"]*"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/i
              );
              console.log('Påslag regex match result:', paaslagMatch);
              
              if (paaslagMatch) {
                const correctPaaslagAmount = paaslagMatch[2].replace(',', '.');
                console.log('Correct Påslag amount from JSON:', correctPaaslagAmount);
                
                // Use the amount from JSON (should be correct if AI reads from right column)
                const finalPaaslagAmount = correctPaaslagAmount;
                console.log('Using Påslag amount from JSON:', finalPaaslagAmount);
                
                // Check if Påslag is in the result (line item may be formatted with or without numbering, with or without bold formatting)
                const paaslagInResult = gptAnswer.match(
                  /(\d+\.\s*)?\*?\*?(Påslag|Tillæg|Tillägg|Handelstillæg|Spot-tillæg)\*?\*?:\s*(\d+(?:[,.]\d+)?)\s*kr/i
                );
                console.log('Påslag in result regex match:', paaslagInResult);
                
                if (paaslagInResult) {
                  const currentPaaslagAmount = paaslagInResult[3].replace(',', '.');
                  console.log('Current Påslag amount in result:', currentPaaslagAmount);
                  
                  if (Math.abs(parseFloat(currentPaaslagAmount) - parseFloat(finalPaaslagAmount)) > 0.01) {
                    console.log('Påslag amount is incorrect, correcting...');
                    
                    // Update the Påslag amount in the result
                    gptAnswer = gptAnswer.replace(
                      /(\d+\.\s*)?\*?\*?(Påslag|Tillæg|Tillägg|Handelstillæg|Spot-tillæg)\*?\*?:\s*(\d+(?:[,.]\d+)?)\s*kr/i,
                      `$1Tillæg: ${finalPaaslagAmount} kr`
                    );
                    
                    // Recalculate total (both monthly and yearly)
                    const currentTotal = gptAnswer.match(/(spara totalt|spar(?:er)? i alt)[^0-9]*(\d+(?:[,.]\d+)?)/i);
                    if (currentTotal) {
                      const totalDiff = parseFloat(finalPaaslagAmount) - parseFloat(currentPaaslagAmount);
                      const newMonthlyTotal = (parseFloat(currentTotal[2].replace(',', '.')) + totalDiff).toFixed(2);
                      const newYearlyTotal = (parseFloat(newMonthlyTotal) * 12).toFixed(2);
                      
                      gptAnswer = gptAnswer.replace(
                        /(spara totalt|spar(?:er)? i alt)[^0-9]*(\d+(?:[,.]\d+)?)/i,
                        `sparer i alt ${newMonthlyTotal}`
                      );
                      gptAnswer = gptAnswer.replace(
                        /= (\d+(?:[,.]\d+)?) kr\/år/i,
                        `= ${newYearlyTotal} kr/år`
                      );
                      gptAnswer = gptAnswer.replace(
                        /spara \[total × 12\] kr\/år/g,
                        `spara ${newYearlyTotal} kr/år`
                      );
                      console.log('Updated Påslag amount and totals');
                    }
                  } else {
                    console.log('Påslag amount is already correct');
                  }
                } else {
                  console.log('Påslag not found in result, but exists in JSON - checking if it should be added');
                  
                  // Check if Påslag is already in the result (to avoid duplicates)
                  const paaslagCount = (gptAnswer.match(/\*?\*?(Påslag|Tillæg|Tillägg|Handelstillæg|Spot-tillæg)\*?\*?:/gi) || []).length;
                  console.log('Påslag count in result:', paaslagCount);
                  const paaslagAlreadyExists = gptAnswer.match(
                    /(\d+\.\s*)?\*?\*?(Påslag|Tillæg|Tillägg|Handelstillæg|Spot-tillæg)\*?\*?:\s*(\d+(?:[,.]\d+)?)\s*kr/i
                  );
                  console.log('Påslag already exists check:', paaslagAlreadyExists);
                  if (paaslagCount === 0) {
                    // Add Påslag to the result if it's missing
                    const currentTotal = gptAnswer.match(/(spara totalt|spar(?:er)? i alt)[^0-9]*(\d+(?:[,.]\d+)?)/i);
                    if (currentTotal) {
                      const newMonthlyTotal = (parseFloat(currentTotal[2].replace(',', '.')) + parseFloat(finalPaaslagAmount)).toFixed(2);
                      const newYearlyTotal = (parseFloat(newMonthlyTotal) * 12).toFixed(2);
                      
                      gptAnswer = gptAnswer.replace(
                      /(Onödiga kostnader|Unødige omkostninger):([\s\S]*?)(Total besparing|Samlet besparelse):/i,
                      `Unødige omkostninger:$2Tillæg: ${finalPaaslagAmount} kr\nSamlet besparelse:`
                      );
                      gptAnswer = gptAnswer.replace(
                        /(spara totalt|spar(?:er)? i alt)[^0-9]*(\d+(?:[,.]\d+)?)/i,
                        `sparer i alt ${newMonthlyTotal}`
                      );
                      gptAnswer = gptAnswer.replace(
                        /= (\d+(?:[,.]\d+)?) kr\/år/i,
                        `= ${newYearlyTotal} kr/år`
                      );
                      gptAnswer = gptAnswer.replace(
                        /spara \[total × 12\] kr\/år/g,
                        `spara ${newYearlyTotal} kr/år`
                      );
                      console.log('Added missing Påslag to result and updated totals');
                    }
                  } else {
                    console.log('Påslag already exists in result, skipping addition');
                  }
                }
              } else {
                console.log('No Påslag found in extracted JSON');
              }
              
              // Check for missed "Elavtal årsavgift"
              if (
                !/Elavtal årsavgift|Aftale årsgebyr|Årsabonnement|Årsgebyr/i.test(gptAnswer)
              ) {
                console.log('Årsgebyr line not found in result, checking extracted JSON...');
                
                const elavtalMatch = cleanJson.match(
                  /"name"\s*:\s*"[^"]*(Elavtal årsavgift|Aftale årsgebyr|Årsabonnement|Årsgebyr)[^"]*"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/i
                );
                console.log('Elavtal regex match result:', elavtalMatch);
                
                if (elavtalMatch) {
                  const amount = elavtalMatch[2].replace(',', '.');
                  console.log('Found Elavtal årsavgift amount:', amount);
                  
                  const currentTotal = gptAnswer.match(/total[^0-9]*(\d+(?:[,.]\d+)?)/i);
                  console.log('Current total match:', currentTotal);
                  
                  if (currentTotal) {
                    const newMonthlyTotal = (parseFloat(currentTotal[1].replace(',', '.')) + parseFloat(amount)).toFixed(2);
                    const newYearlyTotal = (parseFloat(newMonthlyTotal) * 12).toFixed(2);
                    console.log('New monthly total:', newMonthlyTotal, 'New yearly total:', newYearlyTotal);
                    
                    gptAnswer = gptAnswer.replace(
                      /(Onödiga kostnader|Unødige omkostninger):([\s\S]*?)(Total besparing|Samlet besparelse):/i,
                      `Unødige omkostninger:$2Aftale årsgebyr: ${amount} kr\nSamlet besparelse:`
                    );
                    gptAnswer = gptAnswer.replace(
                      /(spara totalt|spar(?:er)? i alt)[^0-9]*(\d+(?:[,.]\d+)?)/i,
                      `sparer i alt ${newMonthlyTotal}`
                    );
                    gptAnswer = gptAnswer.replace(
                      /= (\d+(?:[,.]\d+)?) kr\/år/i,
                      `= ${newYearlyTotal} kr/år`
                    );
                    gptAnswer = gptAnswer.replace(
                      /spara \[total × 12\] kr\/år/g,
                      `spara ${newYearlyTotal} kr/år`
                    );
                    console.log('Updated gptAnswer with Elavtal årsavgift and totals');
                  }
                } else {
                  console.log('No Elavtal årsavgift found in extracted JSON');
                }
              } else {
                console.log('Elavtal årsavgift already found in result');
              }
            } else {
              console.log('No result to post-process');
            }
          }
        } catch (parseError) {
          console.log('Failed to parse extraction JSON:', parseError);
          console.log('Raw response that failed to parse:', extractedJson);
          console.log('Falling back to single-step approach');
        }
      }
    } catch {
      console.log('Two-step approach failed, falling back to single-step approach');
    }

    // Fallback to original single-step approach if two-step failed
    if (!gptAnswer) {
    const xaiRes = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify({
        model: XAI_OCR_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Hvad betaler jeg i unødige omkostninger? Analyser denne elregning efter instruktionerne. SVAR KUN PÅ DANSK - uanset hvilket sprog fakturaen er på.' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.1,
      }),
    });

      if (xaiRes.ok) {
        const gptData = await xaiRes.json();
        gptAnswer = gptData.choices?.[0]?.message?.content || '';
      }
    }

    if (!gptAnswer) {
      return NextResponse.json({ error: 'XAI Vision error - both two-step and fallback approaches failed' }, { status: 500 });
    }

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
              market: INVOICE_MARKET,
              user_agent: userAgent,
              file_mime: mimeType,
              file_size: fileSize,
              image_sha256: imageSha256,
              model: XAI_OCR_MODEL,
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
              // First try SDK upload (works in many environments)
              const uploadRes = await supabase.storage.from(bucketName).upload(storageKey, file, {
                contentType: mimeType,
                upsert: false,
              });

              let uploadedOk = !uploadRes.error;

              // If SDK upload failed (common on edge runtimes), fall back to Storage REST API
              if (!uploadedOk) {
                try {
                  const cleanSupabaseUrl = SUPABASE_URL.replace(/"/g, '').replace(/\/$/, '');
                  // Important: Do NOT URL-encode the full path; slashes must remain as separators
                  const restUrl = `${cleanSupabaseUrl}/storage/v1/object/${bucketName}/${storageKey}`;
                  const arrayBuffer = await file.arrayBuffer();
                  const restRes = await fetch(restUrl, {
                    method: 'POST',
                    headers: {
                      apikey: SUPABASE_SERVICE_ROLE_KEY,
                      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                      'Content-Type': mimeType,
                      'x-upsert': 'false',
                    },
                    body: arrayBuffer,
                  });
                  uploadedOk = restRes.ok;
                } catch (restErr) {
                  console.error('REST upload to Supabase Storage failed:', restErr);
                }
              }

              if (uploadedOk) {
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