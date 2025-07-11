"use client";

import { useState } from 'react';
import styled from 'styled-components';

const ContactFormContainer = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  border: 1px solid #e2e8f0;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #2563eb;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
`;

const CheckboxLabel = styled.label`
  font-size: 13px;
  color: #475569;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
  background: ${props => props.$type === 'success' ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.$type === 'success' ? '#166534' : '#dc2626'};
  border: 1px solid ${props => props.$type === 'success' ? '#bbf7d0' : '#fecaca'};
`;

interface ChatContactFormProps {
  onClose: () => void;
}

export default function ChatContactForm({ onClose }: ChatContactFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Close form after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
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
    <ContactFormContainer>
      <Title>📞 Kontakta oss</Title>
      
      {submitStatus === 'success' && (
        <Message $type="success">
          ✅ Tack! Vi återkommer så snart som möjligt.
        </Message>
      )}

      {submitStatus === 'error' && (
        <Message $type="error">
          ❌ Ett fel uppstod. Försök igen.
        </Message>
      )}

      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          placeholder="Din e-postadress *"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        
        <Input
          type="tel"
          name="phone"
          placeholder="Telefonnummer (valfritt)"
          value={formData.phone}
          onChange={handleInputChange}
        />

        <CheckboxGroup>
          <Checkbox
            type="checkbox"
            id="chatSubscribeNewsletter"
            name="subscribeNewsletter"
            checked={formData.subscribeNewsletter}
            onChange={handleInputChange}
          />
          <CheckboxLabel htmlFor="chatSubscribeNewsletter">
            Prenumerera på nyhetsbrev
          </CheckboxLabel>
        </CheckboxGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Skickar...' : 'Skicka'}
        </SubmitButton>
      </Form>
    </ContactFormContainer>
  );
} 