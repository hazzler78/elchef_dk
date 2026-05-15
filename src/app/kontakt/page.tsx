"use client";

import styled from 'styled-components';
import ContactForm from '@/components/ContactForm';

const Section = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const ContactInfo = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: var(--text-shadow);
`;

const Lead = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  text-shadow: var(--text-shadow);
`;

const EmailLine = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1.05rem;
  color: white;
  font-weight: 600;
  text-shadow: var(--text-shadow);

  a {
    color: #fde68a;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      color: #fef3c7;
    }
  }
`;

export default function Kontakt() {
  return (
    <Section>
      <Container>
        <ContactInfo>
          <Title>Kontakt os</Title>
          <Lead>
            Har du spørgsmål eller vil du i kontakt med os? Udfyld formularen nedenfor, så vender vi tilbage hurtigst
            muligt.
          </Lead>
          <EmailLine>
            E-mail: <a href="mailto:info@elchef.dk">info@elchef.dk</a>
          </EmailLine>
        </ContactInfo>
        
        <ContactForm />
      </Container>
    </Section>
  );
} 