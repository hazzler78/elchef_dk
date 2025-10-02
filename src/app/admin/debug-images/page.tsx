"use client";
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = "grodan2025";

export default function DebugImages() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  const testImageFlow = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Test with invoice ID 9 (from your diagnostic data)
      const testInvoiceId = 9;
      
      // Step 1: Test the file-url endpoint
      const fileUrlResponse = await fetch(`/api/invoice-ocr/file-url?invoiceId=${testInvoiceId}`);
      const fileUrlData = await fileUrlResponse.json();
      
      let proxyTest = null;
      if (fileUrlData?.url) {
        // Step 2: Test the proxy endpoint directly
        const proxyResponse = await fetch(fileUrlData.url);
        proxyTest = {
          status: proxyResponse.status,
          ok: proxyResponse.ok,
          headers: Object.fromEntries(proxyResponse.headers.entries()),
          contentType: proxyResponse.headers.get('content-type')
        };
      }
      
      setResults({
        step1_fileUrl: {
          status: fileUrlResponse.status,
          data: fileUrlData
        },
        step2_proxy: proxyTest,
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
      <h1>Debug: Fakturabilder</h1>
      <p>Testar hela flödet från admin-sidan till bildvisning.</p>
      
      <button 
        onClick={testImageFlow} 
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
        {loading ? 'Testar flödet...' : 'Testa bildflöde'}
      </button>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {results && (
        <div style={{ background: '#f9fafb', padding: 24, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <h2>Testresultat</h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3>Steg 1: File-URL API</h3>
            <p><strong>Status:</strong> {results.step1_fileUrl.status}</p>
            <p><strong>URL:</strong> {results.step1_fileUrl.data?.url || 'Ingen URL'}</p>
            <pre style={{ background: 'white', padding: 12, borderRadius: 4, fontSize: 12, overflow: 'auto' }}>
              {JSON.stringify(results.step1_fileUrl.data, null, 2)}
            </pre>
          </div>

          {results.step2_proxy && (
            <div style={{ marginBottom: 24 }}>
              <h3>Steg 2: Proxy API</h3>
              <p><strong>Status:</strong> {results.step2_proxy.status}</p>
              <p><strong>OK:</strong> {results.step2_proxy.ok ? '✅' : '❌'}</p>
              <p><strong>Content-Type:</strong> {results.step2_proxy.contentType}</p>
              <pre style={{ background: 'white', padding: 12, borderRadius: 4, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(results.step2_proxy, null, 2)}
              </pre>
            </div>
          )}

          {results.step1_fileUrl.data?.url && (
            <div style={{ marginTop: 24, padding: 16, background: '#d1fae5', borderRadius: 6, border: '1px solid #10b981' }}>
              <h3>Testa bildlänk manuellt</h3>
              <p><strong>URL:</strong> <a href={results.step1_fileUrl.data.url} target="_blank" rel="noopener noreferrer">{results.step1_fileUrl.data.url}</a></p>
              <button 
                onClick={() => window.open(results.step1_fileUrl.data.url, '_blank')}
                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, marginRight: 8 }}
              >
                Öppna bild
              </button>
              <button 
                onClick={() => {
                  const img = document.createElement('img');
                  img.src = results.step1_fileUrl.data.url;
                  img.style.maxWidth = '500px';
                  img.onload = () => alert('Bild laddades framgångsrikt!');
                  img.onerror = () => alert('Bild kunde inte laddas!');
                  document.body.appendChild(img);
                }}
                style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4 }}
              >
                Visa bild på sidan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
