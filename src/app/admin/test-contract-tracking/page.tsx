'use client';
import { useState } from 'react';

export default function TestContractTracking() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testContractClick = async (contractType: 'rorligt' | 'fastpris') => {
    setLoading(true);
    try {
      const response = await fetch('/api/events/contract-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractType,
          logId: 999999, // Test ID som inte finns i databasen
          savingsAmount: 1200, // Test besparing
          sessionId: 'test-session-' + Date.now(),
          source: 'test-admin',
          utmSource: 'test',
          utmMedium: 'admin',
          utmCampaign: 'test-tracking'
        })
      });

      const result = await response.json();
      
      setTestResults(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        contractType,
        success: response.ok,
        response: result,
        status: response.status
      }]);

    } catch (error) {
      setTestResults(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        contractType,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'ERROR'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        🧪 Test Contract Tracking
      </h1>

      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px', 
        padding: '1rem', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>ℹ️ Test Information</h3>
        <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.9rem' }}>
          Detta är en test-miljö som skickar testdata till contract-click API:et. 
          Testdata använder <code>logId: 999999</code> och <code>source: 'test-admin'</code> 
          så det inte blandas med riktig statistik.
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => testContractClick('rorligt')}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Testing...' : '🧪 Test Rörligt Klick'}
        </button>

        <button
          onClick={() => testContractClick('fastpris')}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Testing...' : '🧪 Test Fastpris Klick'}
        </button>

        <button
          onClick={clearResults}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🗑️ Rensa Resultat
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <h3 style={{ 
            margin: 0, 
            padding: '1rem', 
            background: '#f9fafb', 
            borderBottom: '1px solid #e5e7eb' 
          }}>
            📊 Test Resultat ({testResults.length} st)
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div key={index} style={{
                padding: '1rem',
                borderBottom: index < testResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: result.success ? '#f0fdf4' : '#fef2f2'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ 
                    fontWeight: '600',
                    color: result.success ? '#166534' : '#dc2626'
                  }}>
                    {result.success ? '✅' : '❌'} {result.contractType} - {result.timestamp}
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontFamily: 'monospace'
                  }}>
                    Status: {result.status}
                  </span>
                </div>
                
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#374151',
                  fontFamily: 'monospace',
                  background: '#f9fafb',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {result.success ? JSON.stringify(result.response, null, 2) : result.error}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>🔍 Nästa Steg</h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li>Klicka på test-knapparna ovan för att verifiera API:et fungerar</li>
          <li>Kontrollera att du får "success: true" i resultaten</li>
          <li>Gå till <a href="/admin/contract-clicks" style={{ color: '#92400e', textDecoration: 'underline' }}>/admin/contract-clicks</a> för att se testdata</li>
          <li>Filtrera på "test-admin" som källa för att se bara testdata</li>
          <li>När du är nöjd, testa med en riktig faktura på /jamfor-elpriser</li>
        </ol>
      </div>
    </div>
  );
}
