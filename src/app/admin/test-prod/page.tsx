"use client";
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = "grodan2025";

export default function TestProd() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    environment: {
      hostname: string;
      protocol: string;
      origin: string;
      userAgent: string;
    };
    fileUrl: { status: number; data: { url?: string; error?: string } };
    proxy: { status: number; ok: boolean; url: string; finalUrl: string } | null;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  const testProduction = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Test environment info
      const envInfo = {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        origin: window.location.origin,
        userAgent: navigator.userAgent
      };
      
      // Test API endpoints
      const fileUrlResponse = await fetch('/api/invoice-ocr/file-url?invoiceId=9');
      const fileUrlData = await fileUrlResponse.json();
      
      let proxyTest = null;
      if (fileUrlData?.url) {
        const proxyResponse = await fetch(fileUrlData.url);
        proxyTest = {
          status: proxyResponse.status,
          ok: proxyResponse.ok,
          url: fileUrlData.url,
          finalUrl: window.location.origin + fileUrlData.url
        };
      }
      
      setResults({
        environment: envInfo,
        fileUrl: {
          status: fileUrlResponse.status,
          data: fileUrlData
        },
        proxy: proxyTest,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      setError(`Test failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setError('');
    } else {
      setError('Fel lösenord!');
    }
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600 }}>
            Logga in
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <h1>Produktionstest</h1>
      <p>Testar vad som händer i produktion vs lokal utveckling.</p>
      
      <button 
        onClick={testProduction} 
        disabled={loading}
        style={{ 
          padding: '12px 24px', 
          fontSize: 16, 
          borderRadius: 6, 
          background: loading ? '#6b7280' : 'var(--primary)', 
          color: 'white', 
          border: 'none', 
          fontWeight: 600,
          marginBottom: 24
        }}
      >
        {loading ? 'Testar...' : 'Testa produktion'}
      </button>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {results && (
        <div style={{ background: '#f9fafb', padding: 24, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <h2>Testresultat</h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3>Miljöinformation</h3>
            <pre style={{ background: 'white', padding: 12, borderRadius: 4, fontSize: 12, overflow: 'auto' }}>
              {JSON.stringify(results.environment, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3>File-URL API</h3>
            <p><strong>Status:</strong> {results.fileUrl.status}</p>
            <pre style={{ background: 'white', padding: 12, borderRadius: 4, fontSize: 12, overflow: 'auto' }}>
              {JSON.stringify(results.fileUrl.data, null, 2)}
            </pre>
          </div>

          {results.proxy && (
            <div style={{ marginBottom: 24 }}>
              <h3>Proxy Test</h3>
              <p><strong>Status:</strong> {results.proxy.status}</p>
              <p><strong>OK:</strong> {results.proxy.ok ? '✅' : '❌'}</p>
              <p><strong>URL:</strong> {results.proxy.url}</p>
              <p><strong>Final URL:</strong> {results.proxy.finalUrl}</p>
            </div>
          )}

          {results.proxy?.finalUrl && (
            <div style={{ marginTop: 24, padding: 16, background: '#d1fae5', borderRadius: 6, border: '1px solid #10b981' }}>
              <h3>Testa bildlänk</h3>
              <p><strong>URL:</strong> <a href={results.proxy.finalUrl} target="_blank" rel="noopener noreferrer">{results.proxy.finalUrl}</a></p>
              <button 
                onClick={() => window.open(results.proxy.finalUrl, '_blank')}
                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, marginRight: 8 }}
              >
                Öppna bild
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
