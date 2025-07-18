'use client';
import { useState, useEffect } from 'react';
// import Tesseract from 'tesseract.js'; // Tas bort
// import { fetchCheapEnergyPrices } from '@/lib/priceService';
// import { CheapEnergyPrices, getElectricityArea } from '@/lib/types';

function getAllNumbers(str: string): number[] {
  const matches = [...str.matchAll(/(\d{1,6}[\.,]?\d{0,3})/g)];
  return matches.map(match => parseFloat(match[1].replace(',', '.')));
}

interface SavingsCalculation {
  currentTotal: number;
  optimalTotal: number;
  potentialSavings: number;
  savingsPercentage: number;
  breakdown: {
    currentBreakdown: Record<string, number>;
    optimalBreakdown: Record<string, number>;
    savingsByCategory: Record<string, number>;
  };
  recommendations: string[];
}

// Ny funktion: Anropa xAI Vision API via din Next.js API-route
async function handleXaiVision(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/xai-vision', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Vision API error');
  const data = await res.json();
  // Mappa svaret till dina fält (justera efter xAI:s faktiska JSON-schema)
  return {
    forbrukning: data.fields?.forbrukning,
    spotpris: data.fields?.medelspotpris,
    fastPaslag: data.fields?.fast_paslag,
    rorligaKostnader: data.fields?.rorliga_kostnader,
    fastAvgift: data.fields?.manadsavgift,
    moms: data.fields?.moms,
    total: data.fields?.totalsumma,
  };
}

export default function JamforElpriser() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showNumberLines, setShowNumberLines] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [savings, setSavings] = useState<SavingsCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Fetch market prices on component mount
  useEffect(() => {
    const loadPrices = async () => {
      try {
        // This part is no longer needed as prices are fetched via API
        // const prices = await fetchCheapEnergyPrices();
        // setMarketPrices(prices);
      } catch (error) {
        console.error('Failed to load market prices:', error);
      }
    };
    loadPrices();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setParsed(null);
      setForm({});
    }
  };

  const handleOcr = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setParsed(null);
    setForm({});
    try {
      const parsedData = await handleXaiVision(file);
      setParsed(parsedData);
      setForm(parsedData);
    } catch {
      setError('Kunde inte tolka fakturan med AI Vision.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = async () => {
    if (!form.forbrukning || !form.total || !postalCode) {
      setError('Fyll i alla fält och postnummer för att beräkna besparingar');
      return;
    }

    setCalculating(true);
    setError('');

    try {
      const consumption = parseFloat(form.forbrukning);
      const currentTotal = parseFloat(form.total);
      // Sanity check and parse all values as number | null
      const spotprisNum = form.spotpris && !isNaN(Number(form.spotpris)) ? Number(form.spotpris) : null;
      const spotPrice = spotprisNum !== null && spotprisNum >= 10 && spotprisNum <= 200 ? spotprisNum : 0;
      const momsNum = form.moms && !isNaN(Number(form.moms)) ? Number(form.moms) : null;
      const moms = momsNum !== null && momsNum >= 0 && momsNum <= 1000 ? momsNum : 0;
      const fastAvgiftNum = form.fastAvgift && !isNaN(Number(form.fastAvgift)) ? Number(form.fastAvgift) : null;
      const fastAvgift = fastAvgiftNum !== null && fastAvgiftNum >= 0 && fastAvgiftNum <= 1000 ? fastAvgiftNum : 0;
      const fastPaslagNum = form.fastPaslag && !isNaN(Number(form.fastPaslag)) ? Number(form.fastPaslag) : null;
      const fastPaslag = fastPaslagNum !== null && fastPaslagNum >= 0 && fastPaslagNum <= 1000 ? fastPaslagNum : 0;
      const rorligaKostnaderNum = form.rorligaKostnader && !isNaN(Number(form.rorligaKostnader)) ? Number(form.rorligaKostnader) : null;
      const rorligaKostnader = rorligaKostnaderNum !== null && rorligaKostnaderNum >= 0 && rorligaKostnaderNum <= 1000 ? rorligaKostnaderNum : 0;
      // Extrahera elöverföring och energiskatt från OCR-rader (om möjligt)
      let eloverforing = 0;
      let energiskatt = 0;
      if (parsed && parsed.allNumberLines) {
        for (const line of (parsed.allNumberLines as unknown as string[])) {
          if (/elöverföring|eloverforing/i.test(line)) {
            const n = getAllNumbers(line);
            if (n.length > 0) eloverforing += n[n.length - 1];
          }
          if (/energiskatt/i.test(line)) {
            const n = getAllNumbers(line);
            if (n.length > 0) energiskatt += n[n.length - 1];
          }
        }
      }
      // Rättvist pris: spotpris * förbrukning + elöverföring + energiskatt + moms
      const fairPrice = (consumption * spotPrice) / 100 + eloverforing + energiskatt + moms;
      if (fairPrice > currentTotal * 10) {
        setError('Optimal kostnad verkar orimlig. Kontrollera att alla värden är rimliga.');
        setCalculating(false);
        return;
      }
      // Onödiga avgifter: fast avgift, fast påslag, rörliga kostnader, övrigt
      const other = currentTotal - (fairPrice + fastAvgift + fastPaslag + rorligaKostnader);
      const unnecessaryFees = fastAvgift + fastPaslag + rorligaKostnader + (other > 0 ? other : 0);
      const potentialSavings = unnecessaryFees;
      const savingsPercentage = (potentialSavings / currentTotal) * 100;

      setSavings({
        currentTotal,
        optimalTotal: fairPrice,
        potentialSavings,
        savingsPercentage,
        breakdown: {
          currentBreakdown: {
            fastAvgift,
            fastPaslag,
            rorligaKostnader,
            other: other > 0 ? other : 0,
            eloverforing,
            energiskatt,
            moms,
            spotpris: spotPrice,
          },
          optimalBreakdown: {
            fairPrice,
            eloverforing,
            energiskatt,
            moms,
            spotpris: spotPrice,
          },
          savingsByCategory: {
            unnecessaryFees,
            fastAvgift,
            fastPaslag,
            rorligaKostnader,
            other: other > 0 ? other : 0,
          },
        },
        recommendations: [
          `Ta bort onödiga avgifter: ${unnecessaryFees.toFixed(2)} kr/månad eller ${(unnecessaryFees * 12).toFixed(0)} kr/år`
        ],
      });
    } catch {
      setError('Kunde inte beräkna besparingar. Kontrollera att alla värden är korrekta.');
    } finally {
      setCalculating(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Place parsing here, just before return, so it's in render scope
  const spotprisNum = form.spotpris && !isNaN(Number(form.spotpris)) ? Number(form.spotpris) : null;
  const fastPaslagNum = form.fastPaslag && !isNaN(Number(form.fastPaslag)) ? Number(form.fastPaslag) : null;
  const rorligaKostnaderNum = form.rorligaKostnader && !isNaN(Number(form.rorligaKostnader)) ? Number(form.rorligaKostnader) : null;
  const fastAvgiftNum = form.fastAvgift && !isNaN(Number(form.fastAvgift)) ? Number(form.fastAvgift) : null;
  const momsNum = form.moms && !isNaN(Number(form.moms)) ? Number(form.moms) : null;

  // Type guard for allNumberLines
  const allNumberLines = Array.isArray(parsed?.allNumberLines) && (parsed.allNumberLines as unknown[]).every(item => typeof item === 'string')
    ? (parsed.allNumberLines as string[])
    : undefined;

  return (
    <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 0' }}>
      <h1>Jämför elpriser</h1>
      <p>Ladda upp din elräkning (bild eller PDF) och se hur mycket du kan spara!</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
          <button onClick={handleOcr} disabled={!file || loading} style={{ marginLeft: 8 }}>
            {loading ? 'Läser av...' : 'Läs av faktura'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#6b7280' }}>eller</span>
          <button 
            onClick={() => {
              setParsed({});
              setForm({});
            }}
            style={{ 
              marginLeft: 8, 
              background: 'none',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            Fyll i manuellt
          </button>
        </div>
      </div>
      
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      
      {/* Glassmorphism for form section */}
      {(
        <form style={{ marginTop: 32, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 16 }}>
          <h3>Verifiera fakturadata</h3>
          {!parsed && (
            <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #fde68a', padding: 12, borderRadius: 6, marginBottom: 16, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <p style={{ margin: 0, color: '#92400e' }}>
                ⚠️ Vi kunde inte automatiskt extrahera alla värden från fakturan. 
                Vänligen fyll i värdena manuellt baserat på den extraherade texten ovan.
              </p>
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Postnummer (för att hitta ditt elområde):
              <input 
                type="text" 
                value={postalCode} 
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="12345"
                style={{ marginLeft: 8, padding: '4px 8px' }}
              />
            </label>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Förbrukning (kWh):
              <input type="number" name="forbrukning" value={form.forbrukning || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.forbrukningLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.forbrukningLine}</div>
              )}
            </label>
            <label>
              Medelspotpris (öre/kWh):
              <input type="number" name="spotpris" value={spotprisNum === null ? '' : spotprisNum} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.spotprisLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.spotprisLine}</div>
              )}
            </label>
            <label>
              Fast påslag (kr):
              <input type="number" name="fastPaslag" value={fastPaslagNum === null ? '' : fastPaslagNum} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.fastPaslagLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.fastPaslagLine}</div>
              )}
            </label>
            <label>
              Rörliga kostnader (kr):
              <input type="number" name="rorligaKostnader" value={rorligaKostnaderNum === null ? '' : rorligaKostnaderNum} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.rorligaLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.rorligaLine}</div>
              )}
            </label>
            <label>
              Månadsavgift/Fasta avgifter (kr):
              <input type="number" name="fastAvgift" value={fastAvgiftNum === null ? '' : fastAvgiftNum} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.fastAvgiftLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.fastAvgiftLine}</div>
              )}
            </label>
            <label>
              Moms (kr):
              <input type="number" name="moms" value={momsNum === null ? '' : momsNum} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.momsLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.momsLine}</div>
              )}
            </label>
            <label>
              Totalsumma (kr):
              <input type="number" name="total" value={form.total || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
              {typeof parsed?.totalLine === 'string' && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>OCR-rad: {parsed.totalLine}</div>
              )}
            </label>
          </div>
          
          <button 
            type="button" 
            onClick={calculateSavings}
            disabled={!form.forbrukning || !form.total || !postalCode || calculating}
            style={{ 
              marginTop: 16, 
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {calculating ? 'Beräknar besparingar...' : 'Beräkna potentiella besparingar'}
          </button>
          
          <button type="button" style={{ marginTop: 16, marginLeft: 8 }} onClick={() => setShowNumberLines(s => !s)}>
            {showNumberLines ? 'Dölj alla rader med siffror' : 'Visa alla rader med siffror'}
          </button>
          
          {showNumberLines && allNumberLines && (
            <div style={{ marginTop: 16 }}>
              <h4>Alla rader med siffror (för manuell kontroll):</h4>
              <ul style={{ fontSize: 13, background: '#fff', border: '1px solid #eee', borderRadius: 6, padding: 8, maxHeight: 200, overflow: 'auto' }}>
                {allNumberLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
      
      {/* Glassmorphism for savings box */}
      {savings && (
        <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 24 }}>
          <h2 style={{ color: '#065f46', marginBottom: '1rem' }}>💚 Dina potentiella besparingar</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.07)', marginBottom: 16, border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Nuvarande kostnad</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {savings.currentTotal.toFixed(2)} kr
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.07)', marginBottom: 16, border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Optimal kostnad</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {savings.optimalTotal.toFixed(2)} kr
              </div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 20, borderRadius: 8, marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>
              🎉 Du kan spara {savings.potentialSavings.toFixed(2)} kr ({savings.savingsPercentage.toFixed(1)}%)
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4>Varifrån kommer besparingarna?</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {savings.breakdown.savingsByCategory.unnecessaryFees > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    🔍 <strong>Dina onödiga avgifter:</strong> {savings.breakdown.savingsByCategory.unnecessaryFees.toFixed(2)} kr/månad eller ${(savings.breakdown.savingsByCategory.unnecessaryFees * 12).toFixed(0)} kr/år
                  </li>
                )}
                {savings.breakdown.savingsByCategory.fastAvgift > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    💰 <strong>Hög månadsavgift:</strong> {savings.breakdown.savingsByCategory.fastAvgift.toFixed(2)} kr
                  </li>
                )}
                {savings.breakdown.savingsByCategory.fastPaslag > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    ⚡ <strong>Högt fast påslag:</strong> {savings.breakdown.savingsByCategory.fastPaslag.toFixed(2)} kr
                  </li>
                )}
                {savings.breakdown.savingsByCategory.rorligaKostnader > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    🚫 <strong>Höga rörliga kostnader:</strong> {savings.breakdown.savingsByCategory.rorligaKostnader.toFixed(2)} kr
                  </li>
                )}
                {savings.breakdown.savingsByCategory.other > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    🚫 <strong>Andra dolda kostnader:</strong> {savings.breakdown.savingsByCategory.other.toFixed(2)} kr
                  </li>
                )}
              </ul>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.07)', marginBottom: 16, border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <h4>Våra rekommendationer:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {savings.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: 4 }}>
                    ✅ {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <a 
              href="https://elchef.se" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              🚀 Byt till bättre elavtal nu!
            </a>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
              Gratis byte • Inga bindningstider • 14 dagar till start
            </p>
          </div>
        </div>
      )}
    </main>
  );
} 