"use client";

import { useState } from 'react';
import styled from 'styled-components';

const ContactSection = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
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
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 201, 107, 0.1);
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
  background: linear-gradient(135deg, rgba(0, 201, 107, 0.5), rgba(22, 147, 255, 0.5));
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--glass-shadow-light);

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--glass-shadow-medium);
    background: linear-gradient(135deg, rgba(0, 201, 107, 0.7), rgba(22, 147, 255, 0.7));
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
    transform: none;
  }
`;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    newsletter: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Validation: phone and email are required
    if (!formData.email || !formData.phone) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '', newsletter: false });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <ContactSection>
      <Container>
        <Title>Kontakta oss</Title>
        <Subtitle>
          Har du frågor om elavtal eller behöver hjälp? Vi finns här för dig!
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Namn</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              // not required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">E-post *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">Meddelande</Label>
            <Input
              as="textarea"
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </FormGroup>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor="newsletter">
              Jag vill prenumerera på nyhetsbrev
            </CheckboxLabel>
          </CheckboxGroup>

          {submitStatus === 'success' && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: 'var(--radius-md)',
              color: '#166534'
            }}>
              Tack för ditt meddelande! Vi återkommer snart.
            </div>
          )}

          {submitStatus === 'error' && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 'var(--radius-md)',
              color: '#dc2626'
            }}>
              Ett fel uppstod. Försök igen senare.
            </div>
          )}

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Skickar...' : 'Skicka meddelande'}
          </SubmitButton>
        </Form>
      </Container>
    </ContactSection>
  );
} 