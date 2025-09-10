// Test script för att simulera invoice analysis
const mockExtractedJson = `[
  {
    "name": "Rörliga kostnader",
    "amount": 17.53,
    "section": "Elhandel",
    "description": "Rörliga kostnader från elleverantören"
  },
  {
    "name": "Fast påslag",
    "amount": 17.02,
    "section": "Elhandel",
    "description": "Fast påslag på elpriset"
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
]`;

// Test regex pattern
const elavtalMatch = mockExtractedJson.match(/"name"\s*:\s*"Elavtal årsavgift"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
console.log('Regex match result:', elavtalMatch);

// Test JSON parsing
try {
  const parsedData = JSON.parse(mockExtractedJson);
  console.log('Parsed data:', parsedData);
  
  const elavtalItem = parsedData.find(item => 
    item.name && item.name.toLowerCase().includes('elavtal årsavgift')
  );
  console.log('Elavtal item found:', elavtalItem);
  
  // Test calculation
  const onodigaKostnader = parsedData.filter(item => 
    item.section === 'Elhandel' && 
    (item.name.includes('Rörliga kostnader') || 
     item.name.includes('Fast påslag') || 
     item.name.includes('Elavtal årsavgift'))
  );
  
  console.log('Onödiga kostnader:', onodigaKostnader);
  
  const total = onodigaKostnader.reduce((sum, item) => sum + item.amount, 0);
  console.log('Total onödiga kostnader:', total);
  
} catch (error) {
  console.error('Parse error:', error);
}
