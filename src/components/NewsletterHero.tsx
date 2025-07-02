"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

const NewsletterHeroSection = styled.section`
  padding: 4rem 1rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: white;
  color: var(--gray-700);
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: var(--gray-600);
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    transform: none;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  justify-content: center;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  accent-color: var(--secondary);
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
  cursor: pointer;
  text-align: left;
`;

const ErrorMessage = styled.div`
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 600;
`;

const SuccessMessage = styled.div`
  color: var(--secondary);
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(16, 185, 129, 0.3);
`;

const Benefits = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
`;

const Benefit = styled.div`
  text-align: center;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

export default function NewsletterHero() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Ange din e-postadress');
      return;
    }
    
    if (!consent) {
      setError('Du måste godkänna att få nyhetsbrev');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSuccess('Tack! Du är nu anmäld till vårt nyhetsbrev. Vi skickar dig snart de bästa elpriserna!');
        setEmail('');
        setConsent(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Ett fel uppstod. Försök igen senare.');
      }
    } catch {
      setError('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NewsletterHeroSection>
      <Container>
        <Title>Få de bästa elpriserna först</Title>
        <Subtitle>
          Registrera dig för vårt nyhetsbrev och få exklusiva erbjudanden, 
          elprisuppdateringar och tips för att spara pengar på din elräkning.
        </Subtitle>
        
        <NewsletterForm onSubmit={handleSubmit}>
          <InputGroup>
            <EmailInput
              type="email"
              placeholder="Din e-postadress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Anmäler...' : 'Anmäl dig gratis'}
            </SubmitButton>
          </InputGroup>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="newsletter-hero-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={isSubmitting}
            />
            <CheckboxLabel htmlFor="newsletter-hero-consent">
              Jag godkänner att få nyhetsbrev från Elchef med erbjudanden och uppdateringar om elpriser. 
              Du kan när som helst avprenumerera genom att klicka på länken i mailet.
            </CheckboxLabel>
          </CheckboxGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </NewsletterForm>

        <Benefits>
          <Benefit>
            <h3>🚀 Exklusiva erbjudanden</h3>
            <p>Få först tillgång till de bästa elpriserna</p>
          </Benefit>
          <Benefit>
            <h3>📊 Elprisuppdateringar</h3>
            <p>Håll dig uppdaterad om marknadens utveckling</p>
          </Benefit>
          <Benefit>
            <h3>💰 Sparatips</h3>
            <p>Få tips för att minska din elräkning</p>
          </Benefit>
        </Benefits>
      </Container>
    </NewsletterHeroSection>
  );
} 