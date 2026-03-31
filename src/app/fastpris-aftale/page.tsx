/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import styled from 'styled-components';
import SalesysForm, { SalesysFormInstance, SalesysFormField } from '@/components/SalesysForm';

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
  const sessionIdRef = React.useRef<string>('');
  
  React.useEffect(() => {
    // Generera eller hämta session ID
    try {
      const existing = typeof window !== 'undefined' ? localStorage.getItem('formSessionId') : null;
      if (existing) {
        sessionIdRef.current = existing;
      } else {
        const generated = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
        sessionIdRef.current = generated;
        if (typeof window !== 'undefined') localStorage.setItem('formSessionId', generated);
      }
    } catch {}
  }, []);
  
  React.useEffect(() => {
    try {
      const ttq: any = (window as any).ttq;
      const cookiebot: any = (window as any).cookiebot || (window as any).Cookiebot || (window as any).CookieControl;
      if (ttq && (!cookiebot || cookiebot?.consent?.marketing)) {
        ttq.track('ViewContent', {
          content_id: 'fastpris-aftale',
          content_name: 'Fastprisaftale',
          content_type: 'product'
        });
        if ((window as any).__ttq_capi) {
          (window as any).__ttq_capi('ViewContent', { content_id: 'fastpris-aftale', content_name: 'Fastprisaftale', content_type: 'product' });
        }
      }
    } catch { /* no-op */ }
  }, []);
  function handleFormReady(formInstance?: SalesysFormInstance) {
    try {
      const container = document.getElementById('fastpris-avtal-container');
      if (!container) return;
      const findPnInput = () => {
        const attrSelector = 'input[placeholder*="personnummer" i], input[name*="personnummer" i], input[id*="personnummer" i], input[aria-label*="personnummer" i]';
        const inp = container.querySelector<HTMLInputElement>(attrSelector);
        if (inp) return inp;
        const labels = Array.from(container.querySelectorAll('label')) as HTMLLabelElement[];
        for (const lbl of labels) {
          if ((lbl.textContent || '').toLowerCase().includes('personnummer')) {
            const forId = lbl.getAttribute('for');
            if (forId) {
              const candidate = container.querySelector<HTMLInputElement>(`#${CSS.escape(forId)}`);
              if (candidate) return candidate;
            }
          }
        }
        const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[];
        for (const candidate of inputs) {
          const parentText = (candidate.parentElement?.textContent || '').toLowerCase();
          if (parentText.includes('personnummer')) return candidate;
        }
        return null;
      };
      const pnInput = findPnInput();
      if (!pnInput && formInstance && typeof formInstance.getFields === 'function') {
        let fired = false;
        const startedAt = Date.now();
        const intervalId = window.setInterval(() => {
          if (fired) return;
          try {
            const fields = formInstance.getFields?.() as SalesysFormField[] | undefined;
            if (Array.isArray(fields)) {
              const pnField = fields.find((f: SalesysFormField) => {
                const key = `${f?.name || ''} ${f?.label || ''}`.toLowerCase();
                return key.includes('personnummer');
              });
              const raw = pnField?.value || '';
              const digits = String(raw).replace(/\D/g, '');
              if (digits.length >= 10) {
                const masked = digits.length >= 4 ? `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : '*'.repeat(digits.length);
                fetch('/api/events/form-field', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    form: 'fastpris-aftale',
                    field: 'personnummer',
                    action: 'filled',
                    valueMasked: masked,
                  }),
                  keepalive: true,
                }).catch(() => {});
                fired = true;
                window.clearInterval(intervalId);
              }
            }
          } catch {}
          if (Date.now() - startedAt > 2 * 60 * 1000) {
            window.clearInterval(intervalId);
          }
        }, 500);
        return;
      }
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
                form: 'fastpris-aftale',
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
        if (digits.length >= 10) fireOnce();
      };

      pnInput.addEventListener('blur', fireOnce);
      pnInput.addEventListener('change', fireOnce);
      pnInput.addEventListener('input', onInput);
      onInput();
      
      // Track postal code changes via getFields polling
      if (formInstance && typeof formInstance.getFields === 'function') {
        let lastPostalCode = '';
        const startedAt = Date.now();
        const trackedPostalCodes = new Set<string>();
        
        const checkPostalCode = () => {
          try {
            const fields = formInstance.getFields?.();
            if (Array.isArray(fields)) {
              // Try to find postal code field by checking all fields
              for (const f of fields) {
                const fieldKey = `${f?.name || ''} ${f?.label || ''}`.toLowerCase();
                const value = String(f?.value || '').replace(/\D/g, '').substring(0, 5);
                
                // Check if this looks like a postal code (3-5 digits) and field name suggests postal code
                // Also check if the field ID matches the known postal code field ID
                const isPostalCodeField = fieldKey.includes('postnummer') || 
                                         fieldKey.includes('postal') || 
                                         fieldKey.includes('postcode') ||
                                         fieldKey.includes('postnummer') ||
                                         (f?.name && f.name.includes('66e9457420ef2d3b8c66f500'));
                
                if (value.length >= 3 && value.length <= 5 && isPostalCodeField) {
                  // Only track if we haven't tracked this postal code before, or if it changed
                  if (value !== lastPostalCode && !trackedPostalCodes.has(value)) {
                    lastPostalCode = value;
                    trackedPostalCodes.add(value);
                    fetch('/api/events/postal-code-search', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        postalCode: value,
                        formType: 'fastpris-aftale',
                        sessionId: sessionIdRef.current,
                      }),
                      keepalive: true,
                    }).catch(() => {});
                  }
                }
              }
            }
          } catch {}
        };
        
        // Initial check
        checkPostalCode();
        
        // Check postal code every second for 2 minutes
        const postalCodeCheckInterval = window.setInterval(() => {
          if (Date.now() - startedAt > 2 * 60 * 1000) {
            window.clearInterval(postalCodeCheckInterval);
            return;
          }
          checkPostalCode();
        }, 1000);
      }
    } catch {}
  }
  return (
    <PageContainer>
      <Content>
        <Title>Fastprisaftale</Title>
        <Subtitle>Se dine personlige priser og påbegynd skiftet til fastpris</Subtitle>
        
        <SupplierInfo>
          <SupplierLogo src="/svealand-logo.png" alt="Svealands Elbolag" />
          <SupplierText>Se dine personlige priser fra Svealands Elbolag</SupplierText>
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
