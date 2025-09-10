// Test script to debug Påslag duplicate issue
const mockCleanJson = `[
  {
    "name": "El inhandlingspris/månadsprissatt",
    "amount": 284.28,
    "section": "Elhandel",
    "description": "Kostnad för el inhandlad under månaden"
  },
  {
    "name": "Elcertifikat",
    "amount": 13.11,
    "section": "Elhandel",
    "description": "Avgift för elcertifikat"
  },
  {
    "name": "Månadsavgift",
    "amount": 55.20,
    "section": "Elhandel",
    "description": "Månatlig avgift för elavtalet"
  },
  {
    "name": "Påslag",
    "amount": 5.50,
    "section": "Elhandel",
    "description": "Påslag på elpriset"
  }
]`;

const mockGptAnswer = `Här är en analys av din elräkning med fokus på onödiga kostnader:

### Onödiga kostnader:
1. Elcertifikat: 13.11 kr
2. Månadsavgift: 55.20 kr

### Total besparing:
Genom att eliminera dessa kostnader kan du spara totalt 68.31 kr.`;

console.log('=== TESTING PÅSLAG POST-PROCESSING ===');
console.log('Mock JSON:', mockCleanJson);
console.log('Mock GPT Answer:', mockGptAnswer);

// Test the regex patterns
const paaslagMatch = mockCleanJson.match(/"name"\s*:\s*"Påslag[^"]*"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
console.log('\nPåslag regex match result:', paaslagMatch);

if (paaslagMatch) {
  const correctPaaslagAmount = paaslagMatch[1].replace(',', '.');
  console.log('Correct Påslag amount from JSON:', correctPaaslagAmount);
  
  const finalPaaslagAmount = correctPaaslagAmount;
  console.log('Using Påslag amount from JSON:', finalPaaslagAmount);
  
  // Check if Påslag is in the result
  const paaslagInResult = mockGptAnswer.match(/(\d+\.\s*)?Påslag:\s*(\d+(?:[,.]\d+)?)\s*kr/);
  console.log('Påslag in result regex match:', paaslagInResult);
  
  if (paaslagInResult) {
    console.log('Påslag already exists in result');
  } else {
    console.log('Påslag not found in result, checking if it should be added');
    
    // Check duplicate count
    const paaslagCount = (mockGptAnswer.match(/Påslag:/g) || []).length;
    console.log('Påslag count in result:', paaslagCount);
    
    if (paaslagCount === 0) {
      console.log('Adding Påslag to result...');
      
      // Simulate the addition
      let newGptAnswer = mockGptAnswer;
      const currentTotal = newGptAnswer.match(/spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i);
      console.log('Current total match:', currentTotal);
      
      if (currentTotal) {
        const newTotal = (parseFloat(currentTotal[1].replace(',', '.')) + parseFloat(finalPaaslagAmount)).toFixed(2);
        console.log('New total would be:', newTotal);
        
        // Add Påslag to the result
        newGptAnswer = newGptAnswer.replace(
          /### Onödiga kostnader:([\s\S]*?)### Total besparing:/,
          `### Onödiga kostnader:$1Påslag: ${finalPaaslagAmount} kr\n### Total besparing:`
        );
        
        // Update total
        newGptAnswer = newGptAnswer.replace(
          /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
          `spara totalt ${newTotal}`
        );
        
        console.log('\n=== FINAL RESULT ===');
        console.log(newGptAnswer);
        
        // Check for duplicates
        const finalPaaslagCount = (newGptAnswer.match(/Påslag:/g) || []).length;
        console.log('\nFinal Påslag count:', finalPaaslagCount);
        
        if (finalPaaslagCount > 1) {
          console.log('❌ DUPLICATE DETECTED!');
        } else {
          console.log('✅ No duplicates');
        }
      }
    } else {
      console.log('Påslag already exists, skipping addition');
    }
  }
} else {
  console.log('No Påslag found in JSON');
}