"use client";

import { useState } from 'react';
import styled from 'styled-components';

const ContactSection = styled.section`
  padding: var(--section-spacing) 0;
  background: white;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
  color: var(--gray-900);
  font-size: 2rem;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 3rem;
  color: var(--gray-600);
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--gray-400);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--primary);
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: var(--gray-600);
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background-color: var(--primary);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark);
  }

  &:disabled {
    background-color: var(--gray-300);
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: var(--secondary);
  color: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background-color: #ef4444;
  color: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 600;
`;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    subscribeNewsletter: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Validera svenska telefonnummer (mobil och fast)
    const phoneRegex = /^(07[0-9]|08[0-9]|09[0-9]|01[0-9])[-\s]?[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{2}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validera telefonnummer
    if (!formData.phone.trim()) {
      setSubmitStatus('error');
      return;
    }
    
    if (!validatePhoneNumber(formData.phone)) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ email: '', phone: '', subscribeNewsletter: true });
      } else {
        setSubmitStatus('error');
        console.error('Form submission error:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContactSection>
      <Container>
        <Title>Kontakta oss</Title>
        <Subtitle>
          Vi behöver ditt telefonnummer för att kunna ringa dig med personlig hjälp. Fyll i formuläret nedan så återkommer vi så snart som möjligt.
        </Subtitle>

        {submitStatus === 'success' && (
          <SuccessMessage>
            Tack för din kontakt! Vi återkommer så snart som möjligt.
          </SuccessMessage>
        )}

        {submitStatus === 'error' && (
          <ErrorMessage>
            Vänligen kontrollera att du har angett ett giltigt svenskt telefonnummer (t.ex. 070-123 45 67).
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">E-postadress *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="din.epost@exempel.se"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Telefonnummer *</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="070-123 45 67"
              required
              pattern="^(07[0-9]|08[0-9]|09[0-9]|01[0-9])[-\s]?[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{2}$"
              title="Ange ett giltigt svenskt mobilnummer eller fast nummer (t.ex. 070-123 45 67)"
            />
          </FormGroup>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="subscribeNewsletter"
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleInputChange}
            />
            <CheckboxLabel htmlFor="subscribeNewsletter">
              Jag vill prenumerera på nyhetsbrev med tips om elavtal och energibesparing
            </CheckboxLabel>
          </CheckboxGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Skickar...' : 'Skicka'}
          </SubmitButton>
        </Form>
      </Container>
    </ContactSection>
  );
} 