"use client";

import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255,255,255,0.8);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
  text-align: center;
`;
const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;
const Lead = styled.p`
  font-size: 1.25rem;
  color: #374151;
  margin-bottom: 2rem;
`;

export default function Foretag() {
  return (
    <Section>
      <Container>
        <Title>Elaftaler til erhverv</Title>
        <Lead>
          En erhvervsaftale for el giver din virksomhed mulighed for at tilpasse energiløsningerne efter behov og forbrug. Med den rette aftale kan I opnå forudsigelige omkostninger, øget fleksibilitet og tryghed mod markedets udsving, så I kan fokusere på det, der er vigtigst – at drive virksomheden effektivt.
        </Lead>
        <GlassButton 
          variant="primary" 
          size="lg" 
          onClick={() => window.open('https://energi2.se/elchef/', '_blank')}
          background={'linear-gradient(135deg, var(--primary), var(--secondary))'}
        >
          Læs mere & tegn erhvervsaftale
        </GlassButton>
      </Container>
    </Section>
  );
} 