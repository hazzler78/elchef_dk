"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

const ContactSection = styled.section`
  background: #f8f9fa;
  padding: 4rem 0;
  color: #333;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #333;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 3rem;
  color: #666;
`;

const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00C96B;
    box-shadow: 0 0 0 3px rgba(0, 201, 107, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00C96B;
    box-shadow: 0 0 0 3px rgba(0, 201, 107, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const Checkbox = styled.input`
  margin-right: 0.75rem;
  transform: scale(1.2);
`;

const CheckboxLabel = styled.label`
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #00C96B, #00A855);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 201, 107, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background: #10b981;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background: #ef4444;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
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
        body: JSON.stringify({
          ...formData,
          subscribeNewsletter: formData.newsletter
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          message: '', 
          newsletter: false
        });
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
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Berätta mer om vad du behöver hjälp med..."
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
              Jag vill prenumerera på nyhetsbrev med tips om elavtal och energibesparing
            </CheckboxLabel>
          </CheckboxGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Skickar...' : 'Skicka meddelande'}
          </SubmitButton>
        </Form>

        {submitStatus === 'success' && (
          <SuccessMessage>
            ✅ Tack för ditt meddelande! Vi återkommer så snart som möjligt.
          </SuccessMessage>
        )}

        {submitStatus === 'error' && (
          <ErrorMessage>
            ❌ Ett fel uppstod. Kontrollera att du har fyllt i alla obligatoriska fält och försök igen.
          </ErrorMessage>
        )}
      </Container>
    </ContactSection>
  );
} 