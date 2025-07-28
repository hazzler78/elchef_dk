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
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'var(--glass-blur)', 
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          boxShadow: 'var(--glass-shadow-medium)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            marginBottom: '1rem',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            Jämför din elräkning med AI
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: '2rem',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            Ladda upp en bild på din elräkning och få en smart, tydlig analys direkt!
          </p>
          
          {!loading && !gptResult && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1.5rem', 
              alignItems: 'stretch'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'stretch'
              }}>
                <label htmlFor="file-upload" style={{ display: 'flex', justifyContent: 'center' }}>
                  <GlassButton as="span" variant="primary" size="lg" background="rgba(0,201,107,0.85)" disableScrollEffect disableHoverEffect>
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
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1rem', 
                  textAlign: 'center',
                  padding: '0.5rem 0',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {file ? file.name : 'Ingen fil vald'}
                </div>
              </div>
              <GlassButton
                onClick={handleGptOcr}
                disabled={!file || loading}
                variant="primary"
                size="lg"
                background="rgba(22,147,255,0.85)"
                disableScrollEffect
                disableHoverEffect
                              >
                  Analysera faktura
                </GlassButton>
            </div>
          )}
        </div>

        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginTop: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'center',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)'
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ 
            marginTop: '2rem', 
            background: 'var(--glass-bg)', 
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)', 
            padding: '3rem 2rem', 
            boxShadow: 'var(--glass-shadow-medium)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: 60, 
              height: 60, 
              border: '4px solid rgba(255, 255, 255, 0.3)', 
              borderTop: '4px solid var(--primary)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem auto'
            }}></div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem', 
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Analyserar din faktura...
            </h3>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              margin: 0,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              AI:n läser av alla kostnader och identifierar dolda avgifter
            </p>
          </div>
        )}

        {gptResult && (
          <div className="analysis-fade-in" style={{ 
            marginTop: '2rem', 
            background: 'var(--glass-bg)', 
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)', 
            padding: '2rem', 
            boxShadow: 'var(--glass-shadow-medium)' 
          }}>
                          <h3 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 600, 
                marginBottom: '1.5rem', 
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                Elbespararens analys
              </h3>
            
            {/* Visa varningar om beräkningar verkar felaktiga */}
            {(() => {
              const validation = validateCalculations(gptResult);
              if (!validation.isValid) {
                return (
                  <div style={{ 
                    marginBottom: '1.5rem', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '1.5rem', 
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)'
                  }}>
                    <h4 style={{ 
                      color: 'white', 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      Varning - Kontrollera beräkningarna
                    </h4>
                    <ul style={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      lineHeight: 1.5,
                      paddingLeft: '1.5rem',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
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
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '1.5rem'
            }}>
              <ReactMarkdown
                components={{
                  h3: (props) => <h3 style={{
                    color: 'var(--primary)', 
                    fontSize: '1.25rem', 
                    marginTop: '1.5rem', 
                    marginBottom: '0.75rem', 
                    borderBottom: '2px solid var(--primary)', 
                    paddingBottom: '0.5rem',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }} {...props} />,
                  h4: (props) => <h4 style={{
                    color: 'var(--secondary)', 
                    fontSize: '1.1rem', 
                    marginTop: '1.25rem', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }} {...props} />,
                  li: (props) => <li style={{
                    marginBottom: '0.5rem', 
                    lineHeight: 1.5,
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }} {...props} />,
                  strong: (props) => <strong style={{
                    color: 'white', 
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }} {...props} />,
                  code: (props) => <code style={{
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '0.125rem 0.375rem', 
                    fontFamily: 'monospace', 
                    color: '#ef4444',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }} {...props} />,
                  p: (props) => <p style={{
                    marginBottom: '0.75rem', 
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }} {...props} />,
                  ul: (props) => <ul style={{
                    marginBottom: '1rem', 
                    paddingLeft: '1.5rem'
                  }} {...props} />,
                  ol: (props) => <ol style={{
                    marginBottom: '1rem', 
                    paddingLeft: '1.5rem'
                  }} {...props} />,
                  blockquote: (props) => (
                    <blockquote style={{
                      borderLeft: '4px solid var(--primary)',
                      paddingLeft: '1rem',
                      margin: '1rem 0',
                      background: 'rgba(0, 201, 107, 0.1)',
                      padding: '0.75rem 1rem',
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                      fontStyle: 'italic',
                      border: '1px solid rgba(0, 201, 107, 0.2)'
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
                          fontSize: '1rem',
                          color: 'white',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }} {...props} />
                      );
                    }
                    return <div {...props} />;
                  }
                }}
              >
                {hasSummarySection(gptResult) ? getSummarySection(gptResult) : gptResult}
              </ReactMarkdown>
            </div>

            {/* Visa knapp för att expandera endast om det finns en slutsats */}
            {hasSummarySection(gptResult) && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <GlassButton
                  variant="secondary"
                  size="md"
                  background="rgba(255, 255, 255, 0.2)"
                  disableScrollEffect
                  disableHoverEffect
                  onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                >
                  {showFullAnalysis ? 'Dölj detaljerad uträkning' : 'Visa hela uträkningen'}
                </GlassButton>
              </div>
            )}

            {/* Visa detaljerad uträkning om expanderad */}
            {showFullAnalysis && hasSummarySection(gptResult) && (
              <div className="analysis-slide-in" style={{ 
                marginTop: '1.5rem', 
                padding: '1.5rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)'
              }}>
                <h4 style={{ 
                  color: 'white', 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  Detaljerad uträkning
                </h4>
                <ReactMarkdown
                  components={{
                    h3: (props) => <h3 style={{
                      color: 'var(--primary)', 
                      fontSize: '1.1rem', 
                      marginTop: '1.25rem', 
                      marginBottom: '0.5rem', 
                      fontWeight: 600,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} {...props} />,
                    h4: (props) => <h4 style={{
                      color: 'var(--secondary)', 
                      fontSize: '1rem', 
                      marginTop: '1rem', 
                      marginBottom: '0.375rem', 
                      fontWeight: 600,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} {...props} />,
                    li: (props) => <li style={{
                      marginBottom: '0.25rem', 
                      lineHeight: 1.4,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }} {...props} />,
                    strong: (props) => <strong style={{
                      color: 'white', 
                      fontWeight: 600,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} {...props} />,
                    p: (props) => <p style={{
                      marginBottom: '0.5rem', 
                      lineHeight: 1.5,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }} {...props} />,
                    ul: (props) => <ul style={{
                      marginBottom: '0.75rem', 
                      paddingLeft: '1rem'
                    }} {...props} />,
                    ol: (props) => <ol style={{
                      marginBottom: '0.75rem', 
                      paddingLeft: '1rem'
                    }} {...props} />
                  }}
                >
                  {getDetailedSection(gptResult)}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Highlighted summary section */}
            <div className="analysis-slide-in" style={{ 
              marginTop: '1.5rem', 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.5rem', 
              border: '2px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)'
            }}>
              <h4 style={{ 
                color: 'white', 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Viktig information
              </h4>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                margin: 0, 
                fontSize: '0.9rem', 
                lineHeight: 1.5,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                AI-analysen kan innehålla fel. Kontrollera alltid mot din faktura innan du fattar beslut. 
                För mer exakt analys, kontakta oss via kontaktformuläret.
              </p>
            </div>

            <div className="analysis-fade-in" style={{ 
              marginTop: '2rem', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1rem' 
            }}>
              <h4 style={{ 
                color: 'white', 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Redo att spara pengar?
              </h4>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                flexWrap: 'wrap', 
                justifyContent: 'center' 
              }}>
                <GlassButton 
                  variant="primary" 
                  size="lg" 
                  background="rgba(0,201,107,0.85)" 
                  disableScrollEffect={true} 
                  disableHoverEffect={true}
                  onClick={() => window.open('https://www.svekraft.com/elchef-rorligt/', '_blank')}
                >
                  Rörligt avtal
                </GlassButton>
                <GlassButton 
                  variant="secondary" 
                  size="lg" 
                  background="rgba(22,147,255,0.85)" 
                  disableScrollEffect={true} 
                  disableHoverEffect={true}
                  onClick={() => window.open('https://www.svealandselbolag.se/elchef-fastpris/', '_blank')}
                >
                  Fastpris
                </GlassButton>
              </div>
              <GlassButton 
                variant="secondary" 
                size="md" 
                background="rgba(255, 255, 255, 0.2)" 
                disableScrollEffect 
                disableHoverEffect 
                onClick={handleUploadNew}
              >
                Ladda upp ny faktura
              </GlassButton>
            </div>
          </div>
        )}
      </main>
    </>
  );
} 