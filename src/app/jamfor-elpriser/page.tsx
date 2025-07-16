'use client';
import { useState } from 'react';
import Tesseract from 'tesseract.js';

function fuzzyIncludes(str: string, arr: string[]) {
  return arr.some(word => str.toLowerCase().replace(/[^a-zåäö0-9]/gi, '')
    .includes(word.toLowerCase().replace(/[^a-zåäö0-9]/gi, '')));
}

function getLastNumber(str: string) {
  // Hitta sista talet (heltal eller decimaltal, med punkt eller komma)
  const matches = [...str.matchAll(/(\d{1,5}[\.,]?\d{0,2})/g)];
  if (!matches.length) return '';
  return matches[matches.length - 1][1].replace(',', '.');
}

function getNumberNear(str: string, keyword: string) {
  // Hitta tal närmast ett visst ord (t.ex. 'öre', 'kr')
  const idx = str.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return '';
  // Dela upp i ord före och efter keyword
  const before = str.slice(0, idx);
  const after = str.slice(idx + keyword.length);
  // Sök efter tal i after först, annars i before
  const afterMatch = after.match(/(\d{1,5}[\.,]?\d{0,2})/);
  if (afterMatch) return afterMatch[1].replace(',', '.');
  const beforeMatch = before.match(/(\d{1,5}[\.,]?\d{0,2})$/);
  if (beforeMatch) return beforeMatch[1].replace(',', '.');
  return '';
}

function parseBill(text: string) {
  const result: Record<string, unknown> = {};
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const allNumberLines = lines.filter(l => l.match(/\d/));
  result.allNumberLines = allNumberLines;

  // Förbrukning (kWh): prioritera rad med 'Förbrukning' och siffra 10-1000
  let forbrukning = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['förbrukning'])) {
      const matches = [...lines[i].matchAll(/(\d{2,4})\s*kwh?/gi)];
      for (const match of matches) {
        const val = parseInt(match[1], 10);
        if (val >= 10 && val <= 1000) { forbrukning = String(val); break; }
      }
      // Om ingen siffra med kWh, ta sista talet på raden om det är rimligt
      if (!forbrukning) {
        const last = getLastNumber(lines[i]);
        if (last && Number(last) >= 10 && Number(last) <= 1000) forbrukning = last;
      }
      if (forbrukning) break;
    }
  }
  result.forbrukning = forbrukning;

  // Medelspotpris (öre/kWh): ta värde närmast 'öre' eller 'öre/kWh'
  let spotpris = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['medelspotpris', 'spotpris'])) {
      spotpris = getNumberNear(lines[i], 'öre');
      if (!spotpris) spotpris = getLastNumber(lines[i]);
      if (spotpris) break;
    }
  }
  result.spotpris = spotpris;

  // Fast påslag (kr): ta sista siffran på rad med 'fast påslag', 'påslag spot', 'påslag', men inte 'rörlig'
  let fastPaslag = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['fast påslag', 'fast paslag', 'påslag spot', 'påslag'])) {
      if (!fuzzyIncludes(lines[i], ['rörlig', 'röriga', 'rorliga'])) {
        fastPaslag = getLastNumber(lines[i]);
        if (fastPaslag) break;
      }
    }
  }
  result.fastPaslag = fastPaslag;

  // Rörliga kostnader (kr): ta sista siffran på rad med 'rörliga kostnader', 'röriga kostnader', 'rorliga kostnader'
  let rorligaKostnader = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['rörliga kostnader', 'röriga kostnader', 'rorliga kostnader'])) {
      rorligaKostnader = getLastNumber(lines[i]);
      if (rorligaKostnader) break;
    }
  }
  result.rorligaKostnader = rorligaKostnader;

  // Fasta avgifter (kr): ta sista siffran på rad med 'abonnemang', 'fast avgift', 'fast avgifter'
  let fastAvgift = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['abonnemang', 'fast avgift', 'fast avgifter'])) {
      fastAvgift = getLastNumber(lines[i]);
      if (fastAvgift) break;
    }
  }
  result.fastAvgift = fastAvgift;

  // Moms (kr): ta sista siffran på första rad med 'moms'
  let moms = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['moms'])) {
      moms = getLastNumber(lines[i]);
      if (moms) break;
    }
  }
  result.moms = moms;

  // Totalsumma (kr): ta sista siffran på rad med 'summa' + 'försäljning' eller 'elnät'
  let total = '';
  for (let i = 0; i < lines.length; i++) {
    if (fuzzyIncludes(lines[i], ['summa']) && (fuzzyIncludes(lines[i], ['försäljning', 'forsaljning', 'elnät', 'elnat']))) {
      total = getLastNumber(lines[i]);
      if (total) break;
    }
  }
  result.total = total;

  return result;
}

export default function JamforElpriser() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showNumberLines, setShowNumberLines] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOcrText('');
      setError('');
      setParsed(null);
      setForm({});
    }
  };

  const handleOcr = async () => {
    if (!file) return;
    setLoading(true);
    setOcrText('');
    setError('');
    setParsed(null);
    setForm({});
    try {
      const { data } = await Tesseract.recognize(file, 'swe', {
        logger: () => {},
      });
      setOcrText(data.text);
      const parsedData = parseBill(data.text);
      setParsed(parsedData as Record<string, string>);
      setForm(parsedData as Record<string, string>);
    } catch {
      setError('Kunde inte läsa av fakturan. Prova en tydligare bild eller PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <main className="container" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0' }}>
      <h1>Jämför elpriser</h1>
      <p>Ladda upp din elräkning (bild eller PDF) och se hur mycket du kan spara!</p>
      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
      <button onClick={handleOcr} disabled={!file || loading} style={{ marginLeft: 8 }}>
        {loading ? 'Läser av...' : 'Läs av faktura'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {ocrText && (
        <div style={{ marginTop: 24 }}>
          <h3>Extraherad text från faktura:</h3>
          <pre style={{ background: '#f3f3f3', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{ocrText}</pre>
        </div>
      )}
      {parsed && (
        <form style={{ marginTop: 32, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
          <h3>Verifiera fakturadata</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label>
              Förbrukning (kWh):
              <input type="number" name="forbrukning" value={form.forbrukning || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
            <label>
              Medelspotpris (öre/kWh):
              <input type="number" name="spotpris" value={form.spotpris || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
            <label>
              Fast påslag (kr):
              <input type="number" name="fastPaslag" value={form.fastPaslag || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
            <label>
              Rörliga kostnader (kr):
              <input type="number" name="rorligaKostnader" value={form.rorligaKostnader || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
            <label>
              Fasta avgifter (kr):
              <input type="number" name="fastAvgift" value={form.fastAvgift || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
            <label>
              Moms (kr):
              <input type="number" name="moms" value={form.moms || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
            <label>
              Totalsumma (kr):
              <input type="number" name="total" value={form.total || ''} onChange={handleFormChange} style={{ marginLeft: 8 }} />
            </label>
          </div>
          <button type="button" style={{ marginTop: 16 }} onClick={() => setShowNumberLines(s => !s)}>
            {showNumberLines ? 'Dölj alla rader med siffror' : 'Visa alla rader med siffror'}
          </button>
          {showNumberLines && parsed?.allNumberLines && Array.isArray(parsed.allNumberLines) && (
            <div style={{ marginTop: 16 }}>
              <h4>Alla rader med siffror (för manuell kontroll):</h4>
              <ul style={{ fontSize: 13, background: '#fff', border: '1px solid #eee', borderRadius: 6, padding: 8, maxHeight: 200, overflow: 'auto' }}>
                {(parsed.allNumberLines as string[]).map((line, i) => (
                  <li key={i} style={{ fontFamily: 'monospace' }}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
    </main>
  );
} 