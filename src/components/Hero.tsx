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

const CTAButton = styled.button`
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

export default function Hero() {
  return (
    <HeroSection>
      <div className="container">
        <HeroContent>
          <TextContent>
            <h1>Spara pengar på ditt elavtal</h1>
            <p>
              Med Elchef hittar du enkelt marknadens bästa elavtal. Vi jämför alla leverantörer 
              och hjälper dig byta - helt kostnadsfritt!
            </p>
            <CTAButton onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>
              Se ditt pris nu
            </CTAButton>
          </TextContent>
          <ImageWrapper>
            <Image
              src="/frog-hero.png"
              alt="Elchef Grodan"
              width={240}
              height={240}
              priority
              style={{ objectFit: 'contain' }}
            />
          </ImageWrapper>
        </HeroContent>
      </div>
    </HeroSection>
  );
} 