"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { fetchCheapEnergyPrices } from '../lib/priceService';
import { CheapEnergyPrices, getElectricityArea } from '../lib/types';

const CalculatorSection = styled.section`
  padding: 4rem 1rem;
  background: #f8fafc;
`;

const CalculatorContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  position: relative;
`;

const Form = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  .helper-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }
`;

const ActionPrompt = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #64748b;
  }
`;

const ContractOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ContractButton = styled.a`
  display: block;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .price {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #0f172a;
  }
  
  .description {
    color: #64748b;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .cta {
    color: #3b82f6;
    font-weight: 600;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &:after {
    content: "";
    width: 2rem;
    height: 2rem;
    border: 2px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const FrogMascot = styled.div`
  position: absolute;
  right: -100px;
  bottom: -50px;
  width: 240px;
  height: 240px;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const FrogMascotMobile = styled.div`
  display: none;
  justify-content: center;
  align-items: center;
  margin: 2rem 0 0 0;
  @media (max-width: 1199px) {
    display: flex;
  }
`;

export default function PriceCalculator() {
  const [postalCode, setPostalCode] = useState('');
  const [livingArea, setLivingArea] = useState('');
  const [prices, setPrices] = useState<CheapEnergyPrices | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!postalCode || postalCode.length !== 5 || !livingArea) return;
    setIsLoading(true);
    setError(null);
    fetchCheapEnergyPrices()
      .then(data => {
        setPrices(data);
      })
      .catch(error => {
        console.error('Failed to fetch prices:', error);
        setError('Kunde inte hämta priser just nu. Försök igen senare.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [postalCode, livingArea]);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setPostalCode(value);
  };

  const handleLivingAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (parseInt(value) <= 1000 || value === '') {
      setLivingArea(value);
    }
  };

  const getFormattedPrice = (price: number) => {
    if (!isMounted) return '...';
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price / 100);
  };

  const shouldShowPrices = prices && postalCode.length === 5 && livingArea;

  const renderPriceOption = (
    title: string,
    price: string,
    description: string,
    href: string,
    ctaText: string
  ) => (
    <ContractButton
      href={isMounted ? href : undefined}
      target={isMounted ? "_blank" : undefined}
      rel={isMounted ? "noopener noreferrer" : undefined}
      style={!isMounted ? { pointerEvents: 'none', opacity: 0.5 } : {}}
    >
      <h3>{title}</h3>
      <div className="price">{price} /kWh</div>
      <div className="description">
        {description.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < description.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      <div className="cta">{ctaText} →</div>
    </ContractButton>
  );

  return (
    <CalculatorSection id="calculator">
      <CalculatorContainer>
        <Form>
          <InputGroup>
            <label htmlFor="postalCode">Postnummer</label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder="12345"
              maxLength={5}
              required
            />
            <span className="helper-text">Vi använder ditt postnummer för att hitta bra elavtal i ditt område</span>
          </InputGroup>
          <InputGroup>
            <label htmlFor="livingArea">Hur stor är bostaden?</label>
            <input
              type="text"
              id="livingArea"
              value={livingArea}
              onChange={handleLivingAreaChange}
              placeholder="T.ex. 80"
              required
            />
            <span className="helper-text">Ange bostadens storlek i kvadratmeter (m²)</span>
          </InputGroup>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          {isLoading && <LoadingSpinner />}
          
          {shouldShowPrices && !isLoading && (
            <>
              <ActionPrompt>
                <h3>Välj det elavtal som passar dig bäst</h3>
                <p>Klicka på något av alternativen nedan för att teckna avtal direkt</p>
              </ActionPrompt>

              <ContractOptions>
                {renderPriceOption(
                  'Rörligt elavtal',
                  prices ? getFormattedPrice(prices.spot_prices[getElectricityArea(postalCode)]) : '...',
                  'Följer elpriset på marknaden.\nIngen bindningstid.',
                  'https://www.cheapenergy.se/elchef-rorligt/',
                  'Välj rörligt avtal'
                )}
                
                {renderPriceOption(
                  'Fast pris 6 månader',
                  prices ? getFormattedPrice(prices.variable_fixed_prices[getElectricityArea(postalCode)]['6_months']) : '...',
                  'Tryggt pris i 6 månader.\nPerfekt för kortsiktig planering.',
                  'https://www.svealandselbolag.se/elchef-fastpris/',
                  'Välj 6 månader'
                )}
                
                {renderPriceOption(
                  'Fast pris 12 månader',
                  prices ? getFormattedPrice(prices.variable_fixed_prices[getElectricityArea(postalCode)]['1_year']) : '...',
                  'Tryggt pris i 12 månader.\nBäst för långsiktig planering.',
                  'https://www.svealandselbolag.se/elchef-fastpris/',
                  'Välj 12 månader'
                )}
              </ContractOptions>
            </>
          )}
        </Form>

        <FrogMascot>
          <Image
            src="/frog-calculator.png"
            alt="Elchef Grodan"
            width={240}
            height={240}
            priority
          />
        </FrogMascot>
        {isMounted && (
          <FrogMascotMobile>
            <Image
              src="/frog-calculator.png"
              alt="Elchef Grodan"
              width={140}
              height={140}
              priority
              style={{ width: 140, height: 140 }}
            />
          </FrogMascotMobile>
        )}
      </CalculatorContainer>
    </CalculatorSection>
  );
} 