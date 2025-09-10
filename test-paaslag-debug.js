// Test script to debug Påslag amount reading issues
const mockJson = `[
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
    "amount": 13.80,
    "section": "Elhandel",
    "description": "Påslag på elpriset"
  }
]`;

const mockResult = `Onödiga kostnader:
Elcertifikat: 13.11 kr
Månadsavgift: 55.20 kr
Påslag: 5.70 kr

Total besparing:
Genom att eliminera dessa kostnader kan du spara totalt 72.01 kr.`;

console.log('=== PÅSLAG DEBUG TEST ===');
console.log('Mock JSON:', mockJson);
console.log('\nMock Result:', mockResult);

// Test regex patterns
const paaslagMatch = mockJson.match(/"name"\s*:\s*"Påslag[^"]*"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
console.log('\nPåslag regex match:', paaslagMatch);

if (paaslagMatch) {
  const correctAmount = paaslagMatch[1];
  console.log('Correct amount from JSON:', correctAmount);
  
  // Test if Påslag exists in result
  const paaslagInResult = mockResult.match(/(\d+\.\s*)?Påslag:\s*(\d+(?:[,.]\d+)?)\s*kr/);
  console.log('Påslag in result match:', paaslagInResult);
  
  if (paaslagInResult) {
    const currentAmount = paaslagInResult[2];
    console.log('Current amount in result:', currentAmount);
    
    if (Math.abs(parseFloat(currentAmount) - parseFloat(correctAmount)) > 0.01) {
      console.log('❌ Amount mismatch detected!');
      console.log('Should correct from', currentAmount, 'to', correctAmount);
    } else {
      console.log('✅ Amount is correct');
    }
  } else {
    console.log('❌ Påslag not found in result');
  }
  
  // Test duplicate check
  const paaslagCount = (mockResult.match(/Påslag:/g) || []).length;
  console.log('Påslag occurrences in result:', paaslagCount);
  
  if (paaslagCount > 1) {
    console.log('❌ Duplicate Påslag detected!');
  } else {
    console.log('✅ No duplicates');
  }
}

console.log('\n=== END TEST ===');
