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
`;

const FallbackText = styled.p`
  color: #374151;
  line-height: 1.55;
  margin: 0;
  font-size: 1rem;
  text-align: center;
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

export default function FastprisAftaleClient({ suppliers }: { suppliers: PublicSupplier[] }) {
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
          content_id: 'fastpris-aftale',
          content_name: 'Fastprisaftale',
          content_type: 'product',
        });
        if (w.__ttq_capi) {
          w.__ttq_capi('ViewContent', {
            content_id: 'fastpris-aftale',
            content_name: 'Fastprisaftale',
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
        <Title>Fastprisaftale</Title>
        <Subtitle>
          Personlig fastpris med tryghed mod udsving — vælg en af vores partnere og kom videre til tilbud og skift.
        </Subtitle>

        <SupplierPanel>
          {suppliers.length > 0 ? (
            <SupplierChoiceGrid
              suppliers={suppliers}
              contractType="fastpris"
              ctaMedium="fastpris-aftale"
              theme="light"
              headline="Vælg elleverandør til fastprisaftale"
              intro="Her vises partnere med fastpris. Månedsgebyr og spot-reference er vejledende — den konkrete fastpris aftaler du hos leverandøren."
            />
          ) : (
            <FallbackText>
              Vi opdaterer listen over elleverandører. Brug sammenligning nedenfor eller kontakt os for et personligt tilbud på fastpris.
            </FallbackText>
          )}
        </SupplierPanel>

        <CtaBox>
          <CtaText>
            Vil du se, hvad du betaler i dag? Upload din regning til AI-analyse, eller gå direkte til skift.
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
