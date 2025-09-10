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

    // Step 1: Extract structured data from invoice
    const extractionPrompt = `Du är en expert på svenska elräkningar från ALLA elleverantörer. Din uppgift är att extrahera ALLA kostnader från fakturan och strukturera dem i JSON-format.

**VIKTIGT - FLEXIBILITET:**
- Du MÅSTE hantera fakturor från ALLA elleverantörer (E.ON, Fortum, Vattenfall, EDF, Göteborg Energi, Stockholm Exergi, m.fl.)
- Olika leverantörer har olika fakturaformat och terminologi - anpassa dig efter varje faktura
- Du MÅSTE alltid svara på svenska, oavsett vilket språk fakturan är på
- Använd endast svenska ord och termer

**EXTRAKTIONSREGEL:**
Extrahera ALLA kostnader från fakturan och returnera dem som en JSON-array. Varje kostnad ska ha:
- "name": exakt text från fakturan (t.ex. "Fast månadsavgift", "Elavtal årsavgift")
- "amount": belopp i kr från "Totalt"-kolumnen (t.ex. 31.20, 44.84) - INTE från "öre/kWh" eller "kr/mån"
- "section": vilken sektion den tillhör ("Elnät" eller "Elhandel")
- "description": kort beskrivning av vad kostnaden är

**KRITISKT FÖR BELOPP:**
- Läs ALLTID från den sista kolumnen som innehåller slutbeloppet i kr
- Ignorera kolumner med "öre/kWh", "kr/mån", "kr/kWh" - dessa är bara pris per enhet
- Slutbeloppet är det som faktiskt debiteras kunden

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
  },
  {
    "name": "Påslag",
    "amount": 13.80,
    "section": "Elhandel",
    "description": "Påslag på elpriset (läs från Totalt-kolumnen, inte från öre/kWh)"
  }
]

**VIKTIGT - FLEXIBELT FÖR ALLA LEVERANTÖRER:**
- Inkludera ALLA kostnader, även de som inte är "onödiga"
- **KRITISKT**: Läs ALLTID beloppet från "Totalt"-kolumnen eller den sista kolumnen med belopp
- Läs INTE från "öre/kWh" eller "kr/mån" kolumner - bara slutbeloppet
- **KRITISKT**: Leta särskilt efter "Elavtal årsavgift" - denna kostnad missas ofta men är viktig
- Var särskilt uppmärksam på "Fast månadsavgift", "Profilpris", "Rörliga kostnader", "Fast påslag", "Påslag"
- Om en kostnad har både års- och månadsbelopp, inkludera månadsbeloppet
- **EXTRA VIKTIGT**: "Elavtal årsavgift" kan stå som en egen rad eller som del av en längre text - leta efter den överallt
- **BELOPPSLÄSNING**: För "Påslag" - läs det exakta beloppet som står i "Totalt"-kolumnen, inte från beräkningen

**LEVERANTÖRSSPECIFIKA TERMER:**
- E.ON: "Elavtal årsavgift", "Fast påslag", "Rörliga kostnader"
- Fortum: "Månadsavgift", "Påslag", "Elcertifikat"
- Vattenfall: "Fast avgift", "Påslag", "Årsavgift"
- EDF: "Abonnemangsavgift", "Påslag", "Serviceavgift"
- Göteborg Energi: "Månadsavgift", "Påslag", "Elcertifikat"
- Stockholm Exergi: "Fast avgift", "Påslag", "Årsavgift"
- Andra leverantörer: Anpassa efter fakturans terminologi

**JSON-FORMAT KRITISKT:**
- Använd endast dubbla citattecken för strängar
- Inga trailing commas
- Inga kommentarer i JSON
- Perfekt formatering krävs
- Starta direkt med [ och sluta med ]

**SLUTLIG PÅMINNELSE:**
- Läs belopp från "Totalt"-kolumnen, INTE från "öre/kWh" eller "kr/mån"
- För "Månadsavgift": läs från "Totalt"-kolumnen (t.ex. 55,20 kr), inte från "kr/mån"-kolumnen
- För "Påslag": läs från "Totalt"-kolumnen (t.ex. 13,80 kr), inte från "öre/kWh"-kolumnen

**KRITISKT EXEMPEL FÖR FORTUM-FAKTUROR:**
På Fortum-fakturor ser du ofta:
- "Påslag: 690 kWh at 2,00 öre/kWh, totaling 13,80 kr"
- Läs ALLTID "13,80 kr" (slutbeloppet), INTE "2,00 öre/kWh" (enhetspriset)
- Samma gäller för "Månadsavgift: 1 Mån at 55,20 kr/mån, totaling 55,20 kr"
- Läs ALLTID "55,20 kr" (slutbeloppet), INTE "55,20 kr/mån" (enhetspriset)

Svara ENDAST med JSON-arrayen, inget annat text.`;

    // Step 2: Calculate unnecessary costs from structured data
    const calculationPrompt = `Du är en expert på svenska elräkningar från ALLA elleverantörer. Baserat på den extraherade JSON-datan, identifiera onödiga kostnader och beräkna total besparing.

**ORDLISTA - ONÖDIGA KOSTNADER (endast under Elhandel):**
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

**LEVERANTÖRSSPECIFIKA ONÖDIGA KOSTNADER:**
- E.ON: "Elavtal årsavgift", "Fast påslag", "Rörliga kostnader"
- Fortum: "Månadsavgift", "Påslag", "Elcertifikat"
- Vattenfall: "Fast avgift", "Påslag", "Årsavgift"
- EDF: "Abonnemangsavgift", "Påslag", "Serviceavgift"
- Göteborg Energi: "Månadsavgift", "Påslag", "Elcertifikat"
- Stockholm Exergi: "Fast avgift", "Påslag", "Årsavgift"
- Andra leverantörer: Identifiera liknande avgifter och påslag

**EXKLUDERA (räknas INTE som onödiga):**
- Moms, Elöverföring, Energiskatt, Medel spotpris, Spotpris, Elpris
- Bundet elpris, Fastpris (själva energipriset), Rörligt elpris (själva energipriset)
- Förbrukning, kWh, Öre/kWh, Kr/kWh

**INSTRUKTION:**
1. Gå igenom JSON-datan och identifiera alla kostnader som matchar ordlistan OCH är under "Elhandel"
2. Summera alla onödiga kostnader
3. Presentera resultatet enligt formatet nedan

**FORMAT:**
Här är en analys av din elräkning med fokus på onödiga kostnader:

### Onödiga kostnader:
1. **[Kostnadsnamn]**: [belopp] kr
2. **[Kostnadsnamn]**: [belopp] kr

### Total besparing:
Genom att eliminera dessa kostnader kan du spara totalt **[total] kr**.

För att minska dessa kostnader bör du byta till ett elavtal utan fasta påslag och avgifter.

Rörligt pris – kampanj utan bindningstid som gäller i ett helt år, helt utan påslag eller avgifter.

Önskar du istället säkra ditt elpris med ett fast avtal, rekommenderar vi ett fastprisavtal med prisgaranti. Du bestämmer själv hur lång tid du vill säkra ditt elpris.

Svara på svenska och var hjälpsam och pedagogisk.`;

    // Original single-step prompt (fallback)
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

**SYFTE:**
Analysera fakturan, leta efter poster som avviker från normala eller nödvändiga avgifter, och förklara dessa poster i ett enkelt och begripligt språk. Ge tips på hur användaren kan undvika dessa kostnader i framtiden eller byta till ett mer förmånligt elavtal.

**VIKTIGT: Efter att du har identifierat alla extra avgifter, summera ALLA belopp och visa den totala besparingen som kunden kan göra genom att byta till ett avtal utan dessa extra kostnader.**

**SÄRSKILT VIKTIGT - LETA EFTER:**
- Alla avgifter som innehåller "år" eller "månad" (t.ex. "årsavgift", "månadsavgift")
- Alla "fasta" eller "rörliga" kostnader
- Alla "påslag" av något slag
- **SÄRSKILT**: Leta efter "Elavtal årsavgift" eller liknande text som innehåller både "elavtal" och "årsavgift"
- **EXTRA VIKTIGT**: "Elavtal årsavgift" är en vanlig extra avgift som ofta missas - leta särskilt efter denna exakta text
- **EXTRA VIKTIGT**: Leta särskilt efter "Rörliga kostnader" eller "Rörlig kostnad" - detta är en vanlig extra avgift som ofta missas
- **SÄRSKILT**: Leta efter "Elcertifikat" eller "Elcertifikatavgift" och inkludera den enligt beräkningsregeln ovan
- Gå igenom VARJE rad på fakturan och kontrollera om den innehåller någon av dessa avgifter
- **KRITISKT**: Om du ser "Fast avgift" under sektionen Elhandel/Elhandelsföretag – inkludera den alltid i onödiga kostnader. Om "Fast avgift" även förekommer under Elnät/Elöverföring ska den EXKLUDERAS. Inkludera endast den under Elhandel.
 - **KRITISKT**: Om du ser "Profilpris" eller "Bundet profilpris" som en EGEN radpost under Elhandel – inkludera den i onödiga kostnader. Om det står under Elnät/Elöverföring ska det EXKLUDERAS.
 - **VIKTIG FÖRVÄXLINGSREGEL**: Blanda inte ihop "Bundet elpris" (själva energipriset per kWh) med "Profilpris". "Bundet elpris", "Elpris", "Fastpris per kWh" och liknande är INTE onödiga kostnader och ska exkluderas. "Profilpris"/"Bundet profilpris" är däremot ett extra påslag och ska inkluderas när det ligger under Elhandel.

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
 - Profilpris, Bundet profilpris

**ORDLISTA - KOSTNADER SOM INTE RÄKNAS SOM EXTRA:**
- Moms, Elöverföring, Energiskatt, Medel spotpris, Spotpris, Elpris
- Bundet elpris, Fastpris (själva energipriset), Rörligt elpris (själva energipriset)
- Förbrukning, kWh, Öre/kWh, Kr/kWh

**VIKTIGT: Inkludera ALLA kostnader från första listan i summeringen av onödiga kostnader. Exkludera kostnader från andra listan.**

**SUMMERING:**
1. Lista ALLA hittade onödiga kostnader med belopp
2. Summera ALLA belopp till en total besparing
3. Visa den totala besparingen tydligt i slutet

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

    // Two-step approach: Extract JSON first, then calculate
    let gptAnswer = '';
    
    try {
      // Step 1: Extract structured data
      const extractionRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
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
          const calculationRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
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
              console.log('Extracted JSON preview:', cleanJson.substring(0, 500));
              
              // Check for "Påslag" amount correction (match any name that starts with Påslag)
              const paaslagMatch = cleanJson.match(/"name"\s*:\s*"Påslag[^"]*"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
              console.log('Påslag regex match result:', paaslagMatch);
              
              if (paaslagMatch) {
                const correctPaaslagAmount = paaslagMatch[1].replace(',', '.');
                console.log('Correct Påslag amount from JSON:', correctPaaslagAmount);
                
                // Check if Påslag is in the result (line item may be formatted with or without numbering)
                const paaslagInResult = gptAnswer.match(/(\d+\.\s*)?Påslag:\s*(\d+(?:[,.]\d+)?)\s*kr/);
                console.log('Påslag in result regex match:', paaslagInResult);
                if (paaslagInResult) {
                  const currentPaaslagAmount = paaslagInResult[2].replace(',', '.');
                  console.log('Current Påslag amount in result:', currentPaaslagAmount);
                  
                  if (Math.abs(parseFloat(currentPaaslagAmount) - parseFloat(correctPaaslagAmount)) > 0.01) {
                    console.log('Påslag amount is incorrect, correcting...');
                    
                    // Update the Påslag amount in the result
                    gptAnswer = gptAnswer.replace(/(\d+\.\s*)?Påslag:\s*(\d+(?:[,.]\d+)?)\s*kr/, `$1Påslag: ${correctPaaslagAmount} kr`);
                    
                    // Recalculate total
                    const currentTotal = gptAnswer.match(/spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i);
                    if (currentTotal) {
                      const totalDiff = parseFloat(correctPaaslagAmount) - parseFloat(currentPaaslagAmount);
                      const newTotal = (parseFloat(currentTotal[1].replace(',', '.')) + totalDiff).toFixed(2);
                      gptAnswer = gptAnswer.replace(
                        /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
                        `spara totalt ${newTotal}`
                      );
                      console.log('Updated Påslag amount and total');
                    }
                  } else {
                    console.log('Påslag amount is already correct');
                  }
                } else {
                  console.log('Påslag not found in result, but exists in JSON - adding it to result');
                  
                  // Check if Påslag is already in the result (to avoid duplicates)
                  const paaslagAlreadyExists = gptAnswer.match(/(\d+\.\s*)?Påslag:\s*(\d+(?:[,.]\d+)?)\s*kr/);
                  if (!paaslagAlreadyExists) {
                    // Add Påslag to the result if it's missing
                    const currentTotal = gptAnswer.match(/spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i);
                    if (currentTotal) {
                      const newTotal = (parseFloat(currentTotal[1].replace(',', '.')) + parseFloat(correctPaaslagAmount)).toFixed(2);
                      
                      gptAnswer = gptAnswer.replace(
                        /### Onödiga kostnader:([\s\S]*?)### Total besparing:/,
                        `### Onödiga kostnader:$1Påslag: ${correctPaaslagAmount} kr\n### Total besparing:`
                      );
                      gptAnswer = gptAnswer.replace(
                        /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
                        `spara totalt ${newTotal}`
                      );
                      console.log('Added missing Påslag to result and updated total');
                    }
                  } else {
                    console.log('Påslag already exists in result, skipping addition');
                  }
                }
              } else {
                console.log('No Påslag found in extracted JSON');
              }
              
              // Check for missed "Elavtal årsavgift"
              if (!gptAnswer.includes('Elavtal årsavgift')) {
                console.log('Elavtal årsavgift not found in result, checking extracted JSON...');
                
                const elavtalMatch = cleanJson.match(/"name"\s*:\s*"Elavtal årsavgift"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
                console.log('Elavtal regex match result:', elavtalMatch);
                
                if (elavtalMatch) {
                  const amount = elavtalMatch[1].replace(',', '.');
                  console.log('Found Elavtal årsavgift amount:', amount);
                  
                  const currentTotal = gptAnswer.match(/total[^0-9]*(\d+(?:[,.]\d+)?)/i);
                  console.log('Current total match:', currentTotal);
                  
                  if (currentTotal) {
                    const newTotal = (parseFloat(currentTotal[1].replace(',', '.')) + parseFloat(amount)).toFixed(2);
                    console.log('New total:', newTotal);
                    
                    gptAnswer = gptAnswer.replace(
                      /### Onödiga kostnader:([\s\S]*?)### Total besparing:/,
                      `### Onödiga kostnader:$1Elavtal årsavgift: ${amount} kr\n### Total besparing:`
                    );
                    gptAnswer = gptAnswer.replace(
                      /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
                      `spara totalt ${newTotal}`
                    );
                    console.log('Updated gptAnswer with Elavtal årsavgift');
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

      if (openaiRes.ok) {
        const gptData = await openaiRes.json();
        gptAnswer = gptData.choices?.[0]?.message?.content || '';
      }
    }

    if (!gptAnswer) {
      return NextResponse.json({ error: 'OpenAI Vision error - both two-step and fallback approaches failed' }, { status: 500 });
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