"use client";

import React from 'react';
import styled from 'styled-components';
import SalesysForm from '@/components/SalesysForm';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 3rem;
  }
`;

const SupplierInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const SupplierLogo = styled.img`
  height: 60px;
  margin-bottom: 1rem;
  object-fit: contain;
`;

const SupplierText = styled.p`
  color: #333;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
`;

const Promo = styled.div`
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  text-align: left;
`;

const PromoTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #111827;
`;

const PromoBullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem 0;
`;

const PromoBullet = styled.li`
  margin: 0.2rem 0;
  color: #111827;
  font-weight: 600;
`;

const PromoText = styled.p`
  margin: 0;
  color: #374151;
  line-height: 1.5;
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

export default function RorligtAvtalPage() {
  // Formulärsida för rörligt elavtal - optimerad för mobil
  return (
    <PageContainer>
      <Content>
        <Title>Byt elavtal</Title>
        <Subtitle>Fyll i formuläret nedan för att påbörja bytet.</Subtitle>
        
        <Promo>
          <PromoTitle>Kampanjpris i 12 månader</PromoTitle>
          <PromoBullets>
            <PromoBullet>0 kr i månadsavgift – 0 öre i påslag</PromoBullet>
          </PromoBullets>
          <PromoText>
            Byt elavtal idag och ta del av ett riktigt förmånligt erbjudande. Du betalar endast för den el du använder – inga dolda avgifter, inga påslag. Gäller i 12 månader från startdatumet.
          </PromoText>
        </Promo>

        <SupplierInfo>
          <SupplierLogo src="/cheap-logo.png" alt="Cheap Energi" />
          <SupplierText>Du kommer att få ett rörligt elavtal från Cheap Energi</SupplierText>
        </SupplierInfo>
        
        <FormContainer>
          <SalesysForm
            containerId="rorligt-avtal-container"
            formId="68b05450a1479b5cec96958c"
            options={{ 
              width: "100%", 
              test: process.env.NODE_ENV === 'development' 
            }}
            defaultFields={[
              { fieldId: "66e9457420ef2d3b8c66f500", value: "2000" }
            ]}
          />
        </FormContainer>
      </Content>
    </PageContainer>
  );
}
