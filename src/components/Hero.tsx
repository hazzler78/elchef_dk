"use client";

import styled from 'styled-components';
import React from 'react';
import GlassButton from './GlassButton';

const HeroSection = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
  overflow: hidden;
  position: relative;
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    align-items: center;
    justify-content: space-between;
  }
`;

const TextContent = styled.div`
  flex: 1;
  max-width: 600px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
  }
  
  p {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const VideoWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  aspect-ratio: 16/9;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--glass-shadow-heavy);
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.2);

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-lg);
  }
`;

const USPList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 2rem 0;
  color: #fff;
  font-size: 1.1rem;
  li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
`;

export default function Hero() {
  const handleVideoClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.muted = !video.muted; // Växla mellan muted och unmuted
    if (!video.muted) {
      video.play();
    }
  };

  return (
    <HeroSection>
      <div className="container">
        <HeroContent>
          <TextContent>
                         <h1>Elchef gör det enkelt att välja rätt elavtal!</h1>
            <p>Snabbt, gratis och utan krångel.</p>
            <USPList>
              <li>✔️ Vi lyfter bara fram elavtal som är värda att överväga.</li>
              <li>✔️ Gratis byte – din gamla avtal sägs upp automatiskt.</li>
              <li>✔️ Full valfrihet – välj mellan rörligt elpris eller fastpris med avtalad period.</li>
            </USPList>
                         <ButtonRow>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: 200 }}>
                 <div style={{
                   transition: 'all 0.3s ease',
                   transform: 'translateY(0)',
                   cursor: 'pointer'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-4px)';
                   e.currentTarget.style.filter = 'brightness(1.1)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.filter = 'brightness(1)';
                 }}
                 onClick={() => window.open('https://www.cheapenergy.se/elchef-rorligt/', '_blank')}
                 >
                   <GlassButton 
                     variant="primary" 
                     size="lg"
                     background="linear-gradient(135deg, rgba(34,197,94,0.9), rgba(22,197,94,0.8))"
                     aria-label="Rörligt avtal - 0 kr i avgifter första året – utan bindningstid"
                     disableHoverEffect={true}
                   >
                     Rörligt avtal
                   </GlassButton>
                 </div>
                 <div style={{ 
                   fontSize: '0.9rem', 
                   color: 'rgba(255, 255, 255, 0.95)', 
                   background: 'rgba(34,197,94,0.2)', 
                   border: '1px solid rgba(34,197,94,0.4)', 
                   padding: '0.35rem 0.6rem', 
                   borderRadius: 9999, 
                   textAlign: 'center',
                   backdropFilter: 'blur(10px)',
                   boxShadow: '0 4px 16px rgba(34,197,94,0.15)'
                 }}>
                   0 kr i avgifter första året – utan bindningstid
                 </div>
               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: 200 }}>
                  <div style={{
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                  onClick={() => window.open('https://www.svealandselbolag.se/elchef-fastpris/', '_blank')}
                  >
                    <GlassButton 
                      variant="secondary" 
                      size="lg"
                      background="linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.8))"
                      aria-label="Fastpris - Fastpris med prisgaranti"
                      disableHoverEffect={true}
                    >
                      Fastpris
                    </GlassButton>
                  </div>
                 <div style={{ 
                   fontSize: '0.9rem', 
                   color: 'rgba(255, 255, 255, 0.95)', 
                   background: 'rgba(59,130,246,0.2)', 
                   border: '1px solid rgba(59,130,246,0.4)', 
                   padding: '0.35rem 0.6rem', 
                   borderRadius: 9999, 
                   textAlign: 'center',
                   backdropFilter: 'blur(10px)',
                   boxShadow: '0 4px 16px rgba(59,130,246,0.15)'
                 }}>
                   Fastpris med prisgaranti
                 </div>
               </div>
            </ButtonRow>
          </TextContent>
          <VideoWrapper>
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              onClick={handleVideoClick}
              style={{ cursor: 'pointer' }}
              title="Klicka för att växla ljud av/på"
            >
              <source src="/Grodan presentation.mp4" type="video/mp4" />
              Din webbläsare stöder inte video-elementet.
            </video>
          </VideoWrapper>
        </HeroContent>
      </div>
    </HeroSection>
  );
} 