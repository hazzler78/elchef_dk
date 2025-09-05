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
  
  /* Dölj fortsätt-knappen i fastpris-formuläret */
  button[type="submit"], 
  input[type="submit"],
  .submit-button,
  .continue-button {
    display: none !important;
  }
`;

export default function FastprisAvtalPage() {
  function handleFormReady() {
    try {
      const container = document.getElementById('fastpris-avtal-container');
      if (!container) return;
      const inputSelector = 'input[placeholder*="personnummer" i], input[name*="personnummer" i], input[id*="personnummer" i]';
      const pnInput = container.querySelector<HTMLInputElement>(inputSelector);
      if (!pnInput) return;

      const fireOnce = () => {
        try {
          const digits = (pnInput.value || '').replace(/\D/g, '');
          if (digits.length >= 10) {
            const masked = digits.length >= 4 ? `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : '*'.repeat(digits.length);
            fetch('/api/events/form-field', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                form: 'fastpris-avtal',
                field: 'personnummer',
                action: 'filled',
                valueMasked: masked,
              }),
              keepalive: true,
            }).catch(() => {});
            pnInput.removeEventListener('blur', fireOnce);
            pnInput.removeEventListener('change', fireOnce);
            pnInput.removeEventListener('input', onInput);
          }
        } catch {}
      };

      const onInput = () => {
        const digits = (pnInput.value || '').replace(/\D/g, '');
        if (digits.length >= 12) fireOnce();
      };

      pnInput.addEventListener('blur', fireOnce);
      pnInput.addEventListener('change', fireOnce);
      pnInput.addEventListener('input', onInput);
    } catch {}
  }
  return (
    <PageContainer>
      <Content>
        <Title>Byt elavtal</Title>
        <Subtitle>Fyll i formuläret nedan för att se priser innan du påbörjar bytet.</Subtitle>
        
        <SupplierInfo>
          <SupplierLogo src="/svealand-logo.png" alt="Svealand Energi" />
          <SupplierText>Du kommer att få ett fastprisavtal från Svealands Elbolag</SupplierText>
        </SupplierInfo>

        <FormContainer>
          <SalesysForm
            containerId="fastpris-avtal-container"
            formId="68b1ea117c19431581b6723a"
            options={{ 
              width: "100%", 
              test: process.env.NODE_ENV === 'development' 
            }}
            defaultFields={[
              { fieldId: "66e9457420ef2d3b8c66f500", value: "2000" }
            ]}
            onReady={handleFormReady}
          />
        </FormContainer>
      </Content>
    </PageContainer>
  );
}
