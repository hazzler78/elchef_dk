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
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export default function FastprisAvtalPage() {
  return (
    <PageContainer>
      <Content>
        <Title>Byt elavtal</Title>
        <Subtitle>Fyll i formuläret nedan för att påbörja bytet.</Subtitle>
        
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
          />
        </FormContainer>
      </Content>
    </PageContainer>
  );
}
