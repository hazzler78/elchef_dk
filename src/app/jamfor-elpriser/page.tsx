'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import GlassButton from '@/components/GlassButton';
import Footer from '@/components/Footer';

export default function JamforElpriser() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gptResult, setGptResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setGptResult(null);
    }
  };

  async function handleGptOcr() {
    if (!file) return;
    setLoading(true);
    setError('');
    setGptResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/gpt-ocr', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Kunde inte analysera fakturan.');
      const data = await res.json();
      setGptResult(data.gptAnswer);
    } catch {
      setError('Kunde inte analysera fakturan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Jämför din elräkning med AI</h1>
        <p style={{ fontSize: 18, color: '#374151', marginBottom: 32 }}>
          Ladda upp en bild på din elräkning och få en smart, tydlig analys direkt!
        </p>
        <div style={{ marginBottom: '2rem' }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleGptOcr} disabled={!file || loading} style={{ marginLeft: 12, padding: '8px 20px', fontSize: 16, borderRadius: 6, background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Analyserar...' : 'Analysera faktura'}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        {gptResult && (
          <div style={{ marginTop: 32, background: '#f3f4f6', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Elbespararens analys</h3>
            <ReactMarkdown
              components={{
                h3: (props) => <h3 style={{color: '#10b981', fontSize: 20, marginTop: 24, marginBottom: 8}} {...props} />,
                h4: (props) => <h4 style={{color: '#2563eb', fontSize: 17, marginTop: 18, marginBottom: 6}} {...props} />,
                li: (props) => <li style={{marginBottom: 4}} {...props} />,
                strong: (props) => <strong style={{color: '#111827'}} {...props} />,
                code: (props) => <code style={{background: '#f3f4f6', borderRadius: 4, padding: '2px 6px'}} {...props} />,
                p: (props) => <p style={{marginBottom: 10}} {...props} />,
              }}
            >
              {gptResult}
            </ReactMarkdown>
            <div style={{ fontSize: 14, color: '#6b7280', margin: '18px 0 0 0', textAlign: 'center' }}>
              Observera: AI-analysen kan innehålla fel. Kontrollera alltid mot din faktura innan du fattar beslut.
            </div>
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 17, marginBottom: 16, color: '#374151' }}>
                Vill du sänka din elkostnad direkt? Byt elavtal enkelt via Elchef!
              </div>
              <a
                href="https://elchef.se/byt-elavtal"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <GlassButton variant="primary" size="lg" background="rgba(16,185,129,0.85)" disableScrollEffect={true} disableHoverEffect={true}>
                  Byt elavtal nu
                </GlassButton>
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
} 