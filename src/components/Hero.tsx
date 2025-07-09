"use client";

import styled from 'styled-components';
import Image from 'next/image';
import React from 'react';

const HeroSection = styled.section`
  padding: var(--section-spacing) 0;
  background: linear-gradient(to bottom, var(--gray-50), white);
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
    color: var(--gray-700);
    
    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
  }
  
  p {
    font-size: 1.25rem;
    color: var(--gray-600);
    margin-bottom: 2rem;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const CTAButton = styled.a`
  background: var(--primary);
  color: white;
  font-size: 1.25rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  text-decoration: none;
  display: inline-block;
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const ImageWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 300px;

  @media (min-width: 768px) {
    height: 400px;
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
  box-shadow: var(--shadow-lg);
  max-width: 600px;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-lg);
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
            <h1>Spara pengar på ditt elavtal</h1>
            <p>
              Med Elchef får du exklusiva rabatter på elavtal. Vi hjälper dig spara pengar på din elräkning - helt kostnadsfritt!
            </p>
            <ButtonRow>
              <CTAButton href="https://www.svekraft.com/elchef-rorligt/" target="_blank" rel="noopener noreferrer">
                Rörligt avtal
              </CTAButton>
              <CTAButton href="https://www.svealandselbolag.se/elchef-fastpris/" target="_blank" rel="noopener noreferrer">
                Fastpris
              </CTAButton>
            </ButtonRow>
          </TextContent>
          <VideoWrapper>
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              poster="/frog-hero.png"
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