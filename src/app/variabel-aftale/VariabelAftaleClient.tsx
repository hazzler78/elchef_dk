'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import type { PublicSupplier } from '@/lib/publicSuppliers';
import { SupplierChoiceGrid } from '@/components/suppliers/SupplierChoiceGrid';

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
  max-width: 960px;
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
    margin-bottom: 2rem;
  }
`;

const SupplierPanel = styled.div`
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

const FallbackText = styled.p`
  color: #374151;
  line-height: 1.55;
  margin: 0;
  font-size: 1rem;
`;

const CtaBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const CtaText = styled.p`
  margin: 0 0 1.25rem 0;
  color: #374151;
  line-height: 1.55;
  font-size: 1rem;
`;

const CtaLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;

  @media (min-width: 640px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const CtaLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

export default function VariabelAftaleClient({ suppliers }: { suppliers: PublicSupplier[] }) {
  React.useEffect(() => {
    try {
      const ttq = (window as unknown as { ttq?: { track: (...args: unknown[]) => void } }).ttq;
      const w = window as unknown as {
        cookiebot?: { consent?: { marketing?: boolean } };
        Cookiebot?: { consent?: { marketing?: boolean } };
        CookieControl?: unknown;
        __ttq_capi?: (...args: unknown[]) => void;
      };
      const cookiebot = w.cookiebot || w.Cookiebot || w.CookieControl;
      if (ttq && (!cookiebot || (cookiebot as { consent?: { marketing?: boolean } }).consent?.marketing)) {
        ttq.track('ViewContent', {
          content_id: 'variabel-aftale',
          content_name: 'Variabel aftale',
          content_type: 'product',
        });
        if (w.__ttq_capi) {
          w.__ttq_capi('ViewContent', {
            content_id: 'variabel-aftale',
            content_name: 'Variabel aftale',
            content_type: 'product',
          });
        }
      }
    } catch {
      /* no-op */
    }
  }, []);

  return (
    <PageContainer>
      <Content>
        <Title>Skift til variabel elaftale</Title>
        <Subtitle>
          Få tydelige priser fra vores samarbejdspartnere — vælg en elleverandør, sammenlign med din nuværende regning eller spring direkte til skift.
        </Subtitle>

        <SupplierPanel>
          {suppliers.length > 0 ? (
            <SupplierChoiceGrid
              suppliers={suppliers}
              contractType="variabel"
              ctaMedium="variabel-aftale"
              theme="light"
              headline="Vælg elleverandør til variabel aftale"
              intro="Alle kan kombineres med variabel aftale. Klik dig videre til sammenligning eller skift — vi hjælper dig uden beregning."
            />
          ) : (
            <FallbackText>
              Vi opdaterer listen over elleverandører. Indtil da kan du sammenligne elpriser via linkene nedenfor eller kontakte os — så finder vi den rigtige aftale til dig.
            </FallbackText>
          )}
        </SupplierPanel>

        <CtaBox>
          <CtaText>
            Upload din elregning for en hurtig AI-analyse, eller spring til skift, hvis du allerede ved, hvad du vil.
          </CtaText>
          <CtaLinks>
            <CtaLink href="/sammenlign-elpriser">Sammenlign elpriser (AI)</CtaLink>
            <CtaLink href="/skift-elaftale">Skift elaftale</CtaLink>
            <CtaLink href="/kontakt">Kontakt os</CtaLink>
          </CtaLinks>
        </CtaBox>
      </Content>
    </PageContainer>
  );
}
