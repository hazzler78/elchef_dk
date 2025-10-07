'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GlassButton from '@/components/GlassButton';
import { withDefaultCtaUtm } from '@/lib/utm';

interface SharedCalculation {
  id: string;
  savingsAmount: number;
  analysisDate: string;
  platform: string;
  isAnonymous: boolean;
}

function DeladKalkylContent() {
  const [calculation, setCalculation] = useState<SharedCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const calculationId = searchParams.get('id');

  useEffect(() => {
    if (calculationId) {
      // Här skulle du hämta kalkyldata från din databas
      // För nu simulerar vi data
      setTimeout(() => {
        setCalculation({
          id: calculationId,
          savingsAmount: 2400,
          analysisDate: new Date().toISOString(),
          platform: 'facebook',
          isAnonymous: true
        });
        setLoading(false);
      }, 1000);
    } else {
      setError('Ingen beregning fundet');
      setLoading(false);
    }
  }, [calculationId]);

  if (loading) {
    return (
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
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
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Laddar delad kalkyl...</h2>
        </div>
      </main>
    );
  }

  if (error || !calculation) {
    return (
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'var(--glass-blur)', 
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          boxShadow: 'var(--glass-shadow-medium)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Beregning ikke fundet</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
            Den delte beregning kunne ikke findes eller er blevet slettet.
          </p>
          <GlassButton
            variant="primary"
            size="lg"
            background="linear-gradient(135deg, var(--primary), var(--secondary))"
            disableScrollEffect
            disableHoverEffect
            onClick={() => window.location.href = '/faktura-analyse'}
          >
            Lav din egen AI-analyse
          </GlassButton>
        </div>
      </main>
    );
  }

  return (
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
          Delt AI-beregning
        </h1>
        
        <div style={{
          background: 'rgba(0, 201, 107, 0.1)',
          border: '2px solid rgba(0, 201, 107, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            {calculation.savingsAmount.toLocaleString('da-DK')} kr/år
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Potentiel besparelse ved at skifte elaftale
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            Om denne analyse
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.6,
            marginBottom: '1rem'
          }}>
            Denne AI-analyse viser, hvor meget der kan spares ved at identificere og undgå unødvendige gebyrer på elregningen. 
            Vores AI læser alle omkostninger og identificerer skjulte gebyrer, som mange overser.
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            margin: 0
          }}>
            Analysen blev delt fra {calculation.platform} • {new Date(calculation.analysisDate).toLocaleDateString('da-DK')}
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Vil du også opdage dine skjulte elgebyrer?
          </h3>
          
          <GlassButton
            variant="primary"
            size="lg"
            background="linear-gradient(135deg, var(--primary), var(--secondary))"
            disableScrollEffect
            disableHoverEffect
            onClick={() => window.location.href = withDefaultCtaUtm('/faktura-analyse', 'shared-calc', 'cta-analyze')}
          >
            Analyser min elregning med AI
          </GlassButton>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            textAlign: 'center',
            margin: 0
          }}>
            Helt gratis • Tager kun få minutter • Ingen binding
          </p>
        </div>
      </div>

      {/* Ytterligare information */}
      <div style={{ 
        background: 'var(--glass-bg)', 
        backdropFilter: 'var(--glass-blur)', 
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--glass-shadow-medium)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Sådan fungerer AI-analysen
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(0, 201, 107, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              📸
            </div>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>1. Upload</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Tag et billede af din elregning
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(22, 147, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              🤖
            </div>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>2. AI-analyse</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              AI'en identificerer skjulte gebyrer
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              💰
            </div>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>3. Besparelse</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Se præcis hvor meget du kan spare
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DeladKalkyl() {
  return (
    <Suspense fallback={
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--section-spacing) 0' }}>
        <div style={{ 
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
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Laddar delad kalkyl...</h2>
        </div>
      </main>
    }>
      <DeladKalkylContent />
    </Suspense>
  );
}
