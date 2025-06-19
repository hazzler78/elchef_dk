"use client";

import styled from 'styled-components';

const Section = styled.section`
  padding: 4rem 0;
  background: #f8fafc;
`;
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.07);
  padding: 3rem 2rem;
  text-align: center;
`;
const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2563eb;
`;
const Lead = styled.p`
  font-size: 1.1rem;
  color: #374151;
  margin-bottom: 2rem;
`;
const MailLink = styled.a`
  display: inline-block;
  padding: 1rem 2.5rem;
  background: #2563eb;
  color: white;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
  margin-bottom: 1.5rem;
  &:hover {
    background: #1741a6;
  }
`;
const Phone = styled.div`
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 600;
`;

export default function Kontakt() {
  return (
    <Section>
      <Container>
        <Title>Kontakta oss</Title>
        <Lead>Har du frågor eller vill komma i kontakt med oss? Skicka ett mail eller ring så återkommer vi så snart vi kan.</Lead>
        <MailLink href="mailto:info@elchef.se">Maila oss på info@elchef.se</MailLink>
        <Phone>eller ring <a href="tel:0736862360" style={{ color: '#2563eb', textDecoration: 'underline' }}>073-686 23 60</a></Phone>
      </Container>
    </Section>
  );
} 