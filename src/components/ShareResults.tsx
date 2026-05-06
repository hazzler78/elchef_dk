'use client';
import { useState } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaCopy, FaShare } from 'react-icons/fa';
import GlassButton from './GlassButton';

interface ShareResultsProps {
  analysisResult: string;
  savingsAmount?: number;
  logId?: number | null;
  onShare?: (platform: string) => void;
}

export default function ShareResults({ analysisResult, savingsAmount, logId, onShare }: ShareResultsProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const parseLocalizedAmount = (raw: string): number => {
    const cleaned = raw.replace(/\s/g, '').replace(/[^0-9,.-]/g, '');
    if (!cleaned) return 0;
    const normalized = cleaned.includes(',')
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned;
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Extrahera besparingsbelopp från analysen (prioritera årlig besparing)
  const extractSavings = (text: string): number => {
    const yearlyPatterns = [
      /=\s*([0-9][0-9.\s,]*)\s*kr\/år/i,
      /(?:spar(?:er)?\s*i\s*alt|spara\s*totalt)\s*([0-9][0-9.\s,]*)\s*kr\/år/i,
      /(?:samlet|total)\s*besparelse[^0-9]{0,40}([0-9][0-9.\s,]*)\s*kr\/år/i,
      /(?:din\s*årlige\s*besparing|din\s*årlige\s*besparelse|din\s*årliga\s*besparing)[^0-9]{0,40}([0-9][0-9.\s,]*)\s*kr\/år/i,
      /(?:spara|spar(?:er)?)\s*([0-9][0-9.\s,]*)\s*kr\/år/i,
    ];
    for (const pattern of yearlyPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseLocalizedAmount(match[1]);
        if (amount > 0) return amount;
      }
    }

    const monthlyPatterns = [
      /(?:du\s*betaler|du\s*betalar)[^0-9]{0,40}([0-9][0-9.\s,]*)\s*kr\/m(?:å|a)nad/i,
      /(?:unødige|onödiga)\s*(?:omkostninger|kostnader)[^0-9]{0,60}([0-9][0-9.\s,]*)\s*kr\/m(?:å|a)nad/i,
    ];
    for (const pattern of monthlyPatterns) {
      const match = text.match(pattern);
      if (match) {
        const monthly = parseLocalizedAmount(match[1]);
        if (monthly > 0) return monthly * 12;
      }
    }

    return savingsAmount || 0;
  };

  const detectedSavings = extractSavings(analysisResult);

  // Generera delningstext
  const generateShareText = (platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter') => {
    const baseText = `💡 AI-analyse af min elregning viser, at jeg betaler ${detectedSavings > 0 ? `${detectedSavings.toLocaleString('da-DK')} kr/år` : 'flere hundrede kroner/år'} i unødvendige gebyrer!`;
    
    const platformTexts = {
      facebook: `${baseText}\n\n🔍 Test selv på elchef.dk/faktura-analyse\n\n#Elbesparelse #AI #Elchef`,
      instagram: `${baseText}\n\n🔍 Test selv på elchef.dk/faktura-analyse\n\n#Elbesparelse #AI #Elchef #Energi`,
      linkedin: `${baseText}\n\nSom energikonsulent ser jeg mange kunder, der betaler unødvendige gebyrer på deres elregninger. Dette AI-værktøj fra Elchef hjælper dig med at identificere skjulte omkostninger.\n\n🔍 Test selv: elchef.dk/faktura-analyse\n\n#Energibesparelse #AI #Elchef #Bæredygtighed`,
      twitter: `${baseText}\n\n🔍 Test selv: elchef.dk/faktura-analyse\n\n#Elbesparelse #AI #Elchef`
    };

    return platformTexts[platform];
  };

  // Generera delnings-URL
  const generateShareUrl = (platform: string, text: string) => {
    const encodedText = encodeURIComponent(text);
    // Generera unik delningslänk baserat på logId
    const shareUrl = logId 
      ? `https://elchef.dk/delt-beregning?id=${logId}`
      : 'https://elchef.dk/faktura-analyse';
    const url = encodeURIComponent(shareUrl);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&hashtag=%23Elbesparelse&display=popup&ref=plugin&src=share_button`,
      // Låt endast texten (som redan innehåller vår länk) delas, utan extra URL-parameter
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      instagram: 'https://www.instagram.com/elchef' // Instagram har ingen direkt delnings-URL
    };

    return urls[platform as keyof typeof urls] || urls.facebook;
  };

  const handleShare = (platform: string) => {
    const text = generateShareText(platform as 'facebook' | 'instagram' | 'linkedin' | 'twitter');
    const url = generateShareUrl(platform, text);
    
    // Spåra delning
    if (onShare) {
      onShare(platform);
    }

    // Spåra i analytics
    try {
      fetch('/api/events/share-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          logId,
          savingsAmount: detectedSavings,
          sessionId: typeof window !== 'undefined' ? localStorage.getItem('invoiceSessionId') : null
        })
      }).catch(() => {});
    } catch {}

    if (platform === 'instagram') {
      // För Instagram, visa instruktioner
      alert('Kopier teksten og del på Instagram:\n\n' + text);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (platform === 'facebook') {
      // Facebook - kopiera text och öppna
      const shareUrl = logId 
        ? `https://elchef.dk/delt-beregning?id=${logId}`
        : 'https://elchef.dk/faktura-analyse';
      
      navigator.clipboard.writeText(text);
      // Använd den enkla sharer.php metoden (fungerar utan App Domains)
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&display=popup`, '_blank', 'width=600,height=400');
      alert('Teksten er kopieret! Indsæt den i Facebook-opslaget (Ctrl+V)');
    } else {
      // Öppna direkt utan popup-kontroll
      window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };



  const copyToClipboard = () => {
    const text = generateShareText('facebook');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!analysisResult) return null;

  return (
    <div style={{
      marginTop: '2rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--glass-shadow-medium)'
    }}>
      <h4 style={{
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <FaShare />
        Del din AI-analyse
      </h4>
      
      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '1.5rem',
        fontSize: '0.95rem',
        lineHeight: 1.5
      }}>
        {detectedSavings > 0 
          ? `Del at du kan spare ${detectedSavings.toLocaleString('da-DK')} kr/år og hjælp andre med at opdage deres skjulte elgebyrer!`
          : 'Del din AI-analyse og hjælp andre med at opdage skjulte elgebyrer!'
        }
      </p>

      {!showShareOptions ? (
        <GlassButton
          variant="primary"
          size="md"
          background="linear-gradient(135deg, var(--primary), var(--secondary))"
          disableScrollEffect
          disableHoverEffect
          onClick={() => setShowShareOptions(true)}
        >
          <FaShare style={{ marginRight: '0.5rem' }} />
          Del resultat
        </GlassButton>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem'
          }}>
            <GlassButton
              variant="secondary"
              size="sm"
              background="rgba(24, 119, 242, 0.8)"
              disableScrollEffect
              disableHoverEffect
              onClick={() => {
                const text = generateShareText('facebook');
                const shareUrl = logId 
                  ? `https://elchef.dk/delt-beregning?id=${logId}`
                  : 'https://elchef.dk/sammenlign-elpriser';
                
                // Kopiera texten automatiskt
                navigator.clipboard.writeText(text);
                
                // Använd den enkla sharer.php metoden (fungerar utan App Domains)
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&display=popup`, '_blank', 'width=600,height=400');
                
                // Visa meddelande
                alert('Teksten er kopieret! Indsæt den i Facebook-opslaget (Ctrl+V)');
              }}
            >
              <FaFacebook style={{ marginRight: '0.5rem' }} />
              Facebook
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="sm"
              background="linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)"
              disableScrollEffect
              disableHoverEffect
              onClick={() => handleShare('instagram')}
            >
              <FaInstagram style={{ marginRight: '0.5rem' }} />
              Instagram
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="sm"
              background="rgba(0, 119, 181, 0.8)"
              disableScrollEffect
              disableHoverEffect
              onClick={() => handleShare('linkedin')}
            >
              <FaLinkedin style={{ marginRight: '0.5rem' }} />
              LinkedIn
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="sm"
              background="rgba(29, 161, 242, 0.8)"
              disableScrollEffect
              disableHoverEffect
              onClick={() => handleShare('twitter')}
            >
              <FaTwitter style={{ marginRight: '0.5rem' }} />
              Twitter
            </GlassButton>
          </div>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <GlassButton
              variant="secondary"
              size="sm"
              background="rgba(255, 255, 255, 0.2)"
              disableScrollEffect
              disableHoverEffect
              onClick={copyToClipboard}
            >
              <FaCopy style={{ marginRight: '0.5rem' }} />
              {copied ? 'Kopieret!' : 'Kopier tekst'}
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="sm"
              background="rgba(255, 255, 255, 0.1)"
              disableScrollEffect
              disableHoverEffect
              onClick={() => setShowShareOptions(false)}
            >
              Luk
            </GlassButton>
          </div>
        </div>
      )}

    </div>
  );
}
