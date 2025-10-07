"use client";

import React from 'react';
import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const Content = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 1.3rem;
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InfoTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
  text-align: center;
`;

const InfoText = styled.p`
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ContractCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
`;

const ContractTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--primary);
  margin-bottom: 1rem;
`;

const ContractDescription = styled.p`
  color: #374151;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ContractFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const FeatureItem = styled.li`
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &::before {
    content: "✓";
    color: #22c55e;
    font-weight: bold;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  
  @media (min-width: 768px) {
    gap: 2rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  
  @media (min-width: 768px) {
    min-width: 220px;
  }
`;

const ButtonLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  font-weight: 600;
`;

const RorligtLabel = styled(ButtonLabel)`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.15);
`;

const FastprisLabel = styled(ButtonLabel)`
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
`;

const NextSteps = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const NextStepsTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--primary);
  margin-bottom: 1rem;
`;

const NextStepsList = styled.ol`
  color: #374151;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
`;

export default function BytElavtal() {
  const handleRorligtClick = () => {
    window.location.href = '/variabel-aftale';
  };

  const handleFastprisClick = () => {
    window.location.href = '/fastpris-aftale';
  };

  return (
    <PageContainer>
      <Content>
        <Header>
          <Title>Vælg din nye elaftale</Title>
          <Subtitle>Sammenlign variabel og fastpris - vælg det der passer dig bedst</Subtitle>
        </Header>

        <InfoSection>
          <InfoTitle>Hvad sker nu?</InfoTitle>
          <InfoText>
            Når du klikker på et af alternativerne nedenfor, kommer du til en enkel formular, hvor du udfylder dine oplysninger. 
            Vi hjælper dig derefter med at skifte aftale til den bedste pris på markedet - helt gratis for dig.
          </InfoText>
        </InfoSection>

        <ComparisonGrid>
          <ContractCard>
            <ContractTitle>Variabel aftale</ContractTitle>
            <ContractDescription>
              Prisen følger markedsprisen og kan variere fra måned til måned. 
              Perfekt hvis du vil have fleksibilitet og tror, at elpriserne vil falde.
            </ContractDescription>
            <ContractFeatures>
              <FeatureItem>0 kr i gebyrer første år</FeatureItem>
              <FeatureItem>Ingen bindingsperiode</FeatureItem>
              <FeatureItem>Følger markedsprisen</FeatureItem>
              <FeatureItem>Kan spare penge ved lave priser</FeatureItem>
            </ContractFeatures>
          </ContractCard>

          <ContractCard>
            <ContractTitle>Fastpris aftale</ContractTitle>
            <ContractDescription>
              Du betaler samme pris gennem hele aftaleperioden, uanset hvad der sker på elmarkedet. 
              Perfekt hvis du vil have forudsigelighed og tror, at elpriserne vil stige.
            </ContractDescription>
            <ContractFeatures>
              <FeatureItem>Fast pris i hele perioden</FeatureItem>
              <FeatureItem>Forudsigelig omkostning</FeatureItem>
              <FeatureItem>Beskyttelse mod prisstigninger</FeatureItem>
              <FeatureItem>Personlige priser baseret på dit forbrug</FeatureItem>
            </ContractFeatures>
          </ContractCard>
        </ComparisonGrid>

        <ButtonContainer>
          <ButtonWrapper>
            <div
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
              onClick={handleRorligtClick}
            >
              <GlassButton 
                variant="primary" 
                size="lg"
                background="linear-gradient(135deg, var(--primary), var(--secondary))"
                aria-label="Variabel aftale - 0 kr i gebyrer første år – uden bindingsperiode"
                disableScrollEffect={true}
                disableHoverEffect={true}
              >
                Vælg variabel aftale
              </GlassButton>
            </div>
            <RorligtLabel>
              0 kr i gebyrer første år – uden bindingsperiode
            </RorligtLabel>
          </ButtonWrapper>

          <ButtonWrapper>
            <div
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
              onClick={handleFastprisClick}
            >
              <GlassButton 
                variant="secondary" 
                size="lg"
                background="linear-gradient(135deg, var(--secondary), var(--primary))"
                aria-label="Fastpris - Fastpris med prisgaranti"
                disableScrollEffect={true}
                disableHoverEffect={true}
              >
                Vælg fastpris aftale
              </GlassButton>
            </div>
            <FastprisLabel>
              Fastpris med prisgaranti
            </FastprisLabel>
          </ButtonWrapper>
        </ButtonContainer>

        <NextSteps>
          <NextStepsTitle>Hvad skal du have klar?</NextStepsTitle>
          <NextStepsList>
            <li>Dit CPR-nummer</li>
            <li>Din adresse og kontaktoplysninger</li>
            <li>Omtrentligt årsforbrug (hvis du kender det)</li>
            <li>5 minutter af din tid</li>
          </NextStepsList>
        </NextSteps>
      </Content>
    </PageContainer>
  );
}