'use client';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import GlassButton from '@/components/GlassButton';

export default function JamforElpriser() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gptResult, setGptResult] = useState<string | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setGptResult(null);
      setShowFullAnalysis(false);
    }
  };

  async function handleGptOcr() {
    if (!file) return;
    setLoading(true);
    setError('');
    setGptResult(null);
    setShowFullAnalysis(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/gpt-ocr', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.gptAnswer) {
        throw new Error('Inget svar från AI:n');
      }
      
      // Kontrollera om AI:n returnerade ett felmeddelande
      if (data.gptAnswer.includes("I'm sorry") || data.gptAnswer.includes("can't assist") || 
          data.gptAnswer.includes("Tyvärr") || data.gptAnswer.includes("kan inte") ||
          data.gptAnswer.includes("Jag kan inte") || data.gptAnswer.includes("kan inte hjälpa")) {
        throw new Error('AI:n kunde inte analysera fakturan. Kontrollera att bilden är tydlig och innehåller en elräkning.');
      }
      
      // Rensa bort matematiska formler från svaret
      let cleanedResult = data.gptAnswer;
      
      // Ta bort formler som ( \frac{...}{...} = ... )
      cleanedResult = cleanedResult.replace(/\( \\frac\{[^}]+\}\{[^}]+\} = [^)]+ \)/g, '');
      
      // Ta bort formler som ( ... + ... = ... )
      cleanedResult = cleanedResult.replace(/\( [^)]*\+[^)]* = [^)]* \)/g, '');
      
      // Ta bort formler som ( ... × ... = ... )
      cleanedResult = cleanedResult.replace(/\( [^)]*×[^)]* = [^)]* \)/g, '');
      
      // Ta bort tomma rader som kan ha skapats
      cleanedResult = cleanedResult.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      setGptResult(cleanedResult);
    } catch (error) {
      console.error('Error analyzing invoice:', error);
      setError(`Kunde inte analysera fakturan: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleUploadNew() {
    setFile(null);
    setGptResult(null);
    setError('');
    setShowFullAnalysis(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Funktion för att extrahera endast slutsatsen och nedåt
  function getSummarySection(text: string) {
    if (!text) return '';
    
    const lines = text.split('\n');
    const startIndex = lines.findIndex(line => line.includes('🎯 Slutsats'));
    
    if (startIndex === -1) {
      // Om ingen slutsats hittas, visa allt
      return text;
    }
    
    return lines.slice(startIndex).join('\n');
  }

  // Funktion för att extrahera allt före slutsatsen
  function getDetailedSection(text: string) {
    if (!text) return '';
    
    const lines = text.split('\n');
    const startIndex = lines.findIndex(line => line.includes('🎯 Slutsats'));
    
    if (startIndex === -1) {
      // Om ingen slutsats hittas, returnera tomt
      return '';
    }
    
    return lines.slice(0, startIndex).join('\n');
  }

  // Funktion för att kontrollera om texten innehåller en slutsats
  function hasSummarySection(text: string) {
    if (!text) return false;
    return text.includes('🎯 Slutsats');
  }

  // Funktion för att validera beräkningar
  function validateCalculations(text: string) {
    if (!text) return { isValid: true, warnings: [] };
    
    const warnings = [];
    
    // Hitta siffror och kontrollera rimlighet
    const numbers = text.match(/\d+[,.]?\d*/g) || [];
    const largeNumbers = numbers.filter(n => parseFloat(n.replace(',', '.')) > 10000);
    
    if (largeNumbers.length > 0) {
      warnings.push('Stora siffror hittades - kontrollera beräkningarna');
    }
    
    // Kontrollera om besparingar verkar orimligt höga
    const savingMatches = text.match(/sparat.*?(\d+[,.]?\d*)/gi);
    if (savingMatches) {
      savingMatches.forEach(match => {
        const amount = parseFloat(match.match(/\d+[,.]?\d*/)?.[0]?.replace(',', '.') || '0');
        if (amount > 1000) {
          warnings.push('Hög besparing hittad - kontrollera beräkningen');
        }
      });
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  return (
    <>
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Jämför din elräkning med AI</h1>
        <p style={{ fontSize: 18, color: '#374151', marginBottom: 32 }}>
          Ladda upp en bild på din elräkning och få en smart, tydlig analys direkt!
        </p>
        {!loading && !gptResult && (
          <div style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            flexDirection: 'column',
            gap: 16, 
            alignItems: 'stretch'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 12,
              alignItems: 'stretch'
            }}>
              <label htmlFor="file-upload" style={{ display: 'flex', justifyContent: 'center' }}>
                <GlassButton as="span" variant="primary" size="md" background="rgba(16,185,129,0.85)" disableScrollEffect disableHoverEffect>
                  Välj fakturabild
                </GlassButton>
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div style={{ 
                color: '#374151', 
                fontSize: 15, 
                textAlign: 'center',
                padding: '8px 0'
              }}>
                {file ? file.name : 'Ingen fil vald'}
              </div>
            </div>
            <GlassButton
              onClick={handleGptOcr}
              disabled={!file || loading}
              variant="primary"
              size="md"
              background="rgba(16,185,129,0.85)"
              disableScrollEffect
              disableHoverEffect
            >
              Analysera faktura
            </GlassButton>
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
                 {loading && (
           <div style={{ 
             marginTop: 32, 
             background: '#f3f4f6', 
             borderRadius: 8, 
             padding: 32, 
             boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
             textAlign: 'center'
           }}>
             <div style={{ 
               width: 60, 
               height: 60, 
               border: '4px solid #e5e7eb', 
               borderTop: '4px solid #10b981', 
               borderRadius: '50%', 
               animation: 'spin 1s linear infinite',
               margin: '0 auto 16px auto'
             }}></div>
             <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#10b981' }}>
               Analyserar din faktura...
             </h3>
             <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>
               AI:n läser av alla kostnader och identifierar dolda avgifter
             </p>
           </div>
         )}
        {gptResult && (
          <div className="analysis-fade-in" style={{ marginTop: 32, background: '#f3f4f6', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#10b981' }}>⚡ Elbespararens analys</h3>
            
            {/* Visa varningar om beräkningar verkar felaktiga */}
            {(() => {
              const validation = validateCalculations(gptResult);
              if (!validation.isValid) {
                return (
                  <div style={{ 
                    marginBottom: 16, 
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
                    borderRadius: 8, 
                    padding: 16, 
                    border: '2px solid #ef4444',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
                  }}>
                    <h4 style={{ 
                      color: '#991b1b', 
                      fontSize: 16, 
                      fontWeight: 600, 
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      ⚠️ Varning - Kontrollera beräkningarna
                    </h4>
                    <ul style={{ 
                      color: '#991b1b', 
                      margin: 0, 
                      fontSize: 14, 
                      lineHeight: 1.5,
                      paddingLeft: 20
                    }}>
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Visa endast sammanfattningen först */}
            <ReactMarkdown
              components={{
                h3: (props) => <h3 style={{color: '#10b981', fontSize: 20, marginTop: 24, marginBottom: 12, borderBottom: '2px solid #10b981', paddingBottom: 8}} {...props} />,
                h4: (props) => <h4 style={{color: '#2563eb', fontSize: 17, marginTop: 20, marginBottom: 8, fontWeight: 600}} {...props} />,
                li: (props) => <li style={{marginBottom: 6, lineHeight: 1.5}} {...props} />,
                strong: (props) => <strong style={{color: '#111827', fontWeight: 600}} {...props} />,
                code: (props) => <code style={{background: '#e5e7eb', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', color: '#dc2626'}} {...props} />,
                p: (props) => <p style={{marginBottom: 12, lineHeight: 1.6}} {...props} />,
                ul: (props) => <ul style={{marginBottom: 16, paddingLeft: 20}} {...props} />,
                ol: (props) => <ol style={{marginBottom: 16, paddingLeft: 20}} {...props} />,
                blockquote: (props) => (
                  <blockquote style={{
                    borderLeft: '4px solid #10b981',
                    paddingLeft: 16,
                    margin: '16px 0',
                    background: 'rgba(16,185,129,0.05)',
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                    fontStyle: 'italic'
                  }} {...props} />
                ),
                // Custom styling för viktiga siffror och slutsatser
                div: (props) => {
                  const content = props.children?.toString() || '';
                  if (content.includes('Detta är summan du har i el:') || 
                      content.includes('Detta är summan du har i extraavgifter:') ||
                      content.includes('Vid byte till ett avtal utan extraavgifter skulle du')) {
                    return (
                      <div className="analysis-summary analysis-highlight" style={{
                        fontWeight: 600,
                        fontSize: 16
                      }} {...props} />
                    );
                  }
                  return <div {...props} />;
                }
              }}
            >
              {hasSummarySection(gptResult) ? getSummarySection(gptResult) : gptResult}
            </ReactMarkdown>

            {/* Visa knapp för att expandera endast om det finns en slutsats */}
            {hasSummarySection(gptResult) && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <GlassButton
                  variant="secondary"
                  size="md"
                  background="rgba(107,114,128,0.85)"
                  disableScrollEffect
                  disableHoverEffect
                  onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                >
                  {showFullAnalysis ? '🔽 Dölj detaljerad uträkning' : '📊 Visa hela uträkningen'}
                </GlassButton>
              </div>
            )}

            {/* Visa detaljerad uträkning om expanderad */}
            {showFullAnalysis && hasSummarySection(gptResult) && (
              <div className="analysis-slide-in" style={{ 
                marginTop: 20, 
                padding: 20, 
                background: 'rgba(255,255,255,0.8)', 
                borderRadius: 8, 
                border: '1px solid rgba(0,0,0,0.1)' 
              }}>
                <h4 style={{ color: '#374151', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                  📋 Detaljerad uträkning
                </h4>
                <ReactMarkdown
                  components={{
                    h3: (props) => <h3 style={{color: '#10b981', fontSize: 18, marginTop: 20, marginBottom: 8, fontWeight: 600}} {...props} />,
                    h4: (props) => <h4 style={{color: '#2563eb', fontSize: 16, marginTop: 16, marginBottom: 6, fontWeight: 600}} {...props} />,
                    li: (props) => <li style={{marginBottom: 4, lineHeight: 1.4}} {...props} />,
                    strong: (props) => <strong style={{color: '#111827', fontWeight: 600}} {...props} />,
                    p: (props) => <p style={{marginBottom: 8, lineHeight: 1.5}} {...props} />,
                    ul: (props) => <ul style={{marginBottom: 12, paddingLeft: 16}} {...props} />,
                    ol: (props) => <ol style={{marginBottom: 12, paddingLeft: 16}} {...props} />
                  }}
                >
                  {getDetailedSection(gptResult)}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Highlighted summary section */}
            <div className="analysis-slide-in" style={{ 
              marginTop: 24, 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              borderRadius: 8, 
              padding: 20, 
              border: '2px solid #f59e0b',
              boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
            }}>
              <h4 style={{ 
                color: '#92400e', 
                fontSize: 18, 
                fontWeight: 600, 
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                💡 Viktig information
              </h4>
              <p style={{ 
                color: '#92400e', 
                margin: 0, 
                fontSize: 14, 
                lineHeight: 1.5 
              }}>
                AI-analysen kan innehålla fel. Kontrollera alltid mot din faktura innan du fattar beslut. 
                För mer exakt analys, kontakta oss via kontaktformuläret.
              </p>
            </div>

            <div className="analysis-fade-in" style={{ marginTop: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <h4 style={{ color: '#374151', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                🚀 Redo att spara pengar?
              </h4>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <GlassButton 
                  variant="primary" 
                  size="lg" 
                  background="rgba(16,185,129,0.85)" 
                  disableScrollEffect={true} 
                  disableHoverEffect={true}
                  onClick={() => window.open('https://www.svekraft.com/elchef-rorligt/', '_blank')}
                >
                  💚 Rörligt avtal
                </GlassButton>
                <GlassButton 
                  variant="secondary" 
                  size="lg" 
                  background="rgba(22,147,255,0.85)" 
                  disableScrollEffect={true} 
                  disableHoverEffect={true}
                  onClick={() => window.open('https://www.svealandselbolag.se/elchef-fastpris/', '_blank')}
                >
                  🔒 Fastpris
                </GlassButton>
              </div>
              <GlassButton 
                variant="secondary" 
                size="md" 
                background="rgba(22,147,255,0.85)" 
                disableScrollEffect 
                disableHoverEffect 
                onClick={handleUploadNew}
              >
                📄 Ladda upp ny faktura
              </GlassButton>
            </div>
          </div>
        )}
      </main>
    </>
  );
} 