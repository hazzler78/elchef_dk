'use client';

import React from 'react';
import styled from 'styled-components';
import type { PublicSupplier, PublicSupplierContractFilter } from '@/lib/publicSuppliers';
import { SupplierChoiceGrid } from '@/components/suppliers/SupplierChoiceGrid';

const PageContainer = styled.div`
  min-height: calc(100vh - 5.5rem);
  padding: 2rem 1rem 4rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem 5rem;
  }
`;

const Content = styled.div`
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

const PageHeader = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.85rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 2.35rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 auto;
  max-width: 36rem;
  line-height: 1.55;
`;

const Steps = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 560px) {
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
  }
`;

const Step = styled.li<{ $active?: boolean }>`
  flex: 1;
  max-width: 220px;
  margin: 0 auto;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  color: ${(p) => (p.$active ? '#1c1917' : 'rgba(255,255,255,0.9)')};
  background: ${(p) =>
    p.$active ? 'var(--cta-gradient)' : 'rgba(255, 255, 255, 0.12)'};
  border: 1px solid ${(p) => (p.$active ? 'transparent' : 'rgba(255,255,255,0.2)')};
  box-shadow: ${(p) => (p.$active ? 'var(--cta-shadow)' : 'none')};

  @media (min-width: 560px) {
    margin: 0;
  }

  span {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    opacity: 0.85;
    margin-bottom: 0.15rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
`;

const MainCard = styled.section`
  background: #fffbeb;
  border-radius: 24px;
  padding: 1.5rem 1.25rem 1.75rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.5);

  @media (min-width: 768px) {
    padding: 2rem 2rem 2.25rem;
  }
`;

const CardLead = styled.p`
  margin: 0 0 1.25rem;
  text-align: center;
  color: #44403c;
  font-size: 1.05rem;
  line-height: 1.55;
  font-weight: 500;
`;

const FallbackText = styled.p`
  color: #57534e;
  line-height: 1.6;
  margin: 0;
  font-size: 1rem;
  text-align: center;
`;

const FooterNote = styled.p`
  margin: 1.5rem 0 0;
  text-align: center;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.5;

  a {
    color: #fde68a;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      color: #fef3c7;
    }
  }
`;

export type AftaleFlowLayoutProps = {
  suppliers: PublicSupplier[];
  contractType: PublicSupplierContractFilter;
  ctaMedium: string;
  viewContentId: string;
  viewContentName: string;
  title: string;
  subtitle: string;
  cardLeadWithSuppliers: string;
  cardLeadWithoutSuppliers: string;
  fallback: React.ReactNode;
  footer: React.ReactNode;
};

export default function AftaleFlowLayout({
  suppliers,
  contractType,
  ctaMedium,
  viewContentId,
  viewContentName,
  title,
  subtitle,
  cardLeadWithSuppliers,
  cardLeadWithoutSuppliers,
  fallback,
  footer,
}: AftaleFlowLayoutProps) {
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
          content_id: viewContentId,
          content_name: viewContentName,
          content_type: 'product',
        });
        if (w.__ttq_capi) {
          w.__ttq_capi('ViewContent', {
            content_id: viewContentId,
            content_name: viewContentName,
            content_type: 'product',
          });
        }
      }
    } catch {
      /* no-op */
    }
  }, [viewContentId, viewContentName]);

  return (
    <PageContainer>
      <Content>
        <PageHeader>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </PageHeader>

        <Steps aria-label="Sådan skifter du">
          <Step $active>
            <span>Trin 1</span>
            Vælg leverandør
          </Step>
          <Step>
            <span>Trin 2</span>
            Gennemfør skiftet
          </Step>
          <Step>
            <span>Trin 3</span>
            Spar på elregningen
          </Step>
        </Steps>

        <MainCard aria-labelledby="supplier-choice-heading">
          <CardLead id="supplier-choice-heading">
            {suppliers.length > 0 ? cardLeadWithSuppliers : cardLeadWithoutSuppliers}
          </CardLead>

          {suppliers.length > 0 ? (
            <SupplierChoiceGrid
              suppliers={suppliers}
              contractType={contractType}
              ctaMedium={ctaMedium}
              theme="light"
              primaryOnly
              compact
              headline=""
              intro=""
            />
          ) : (
            <FallbackText>{fallback}</FallbackText>
          )}
        </MainCard>

        <FooterNote>{footer}</FooterNote>
      </Content>
    </PageContainer>
  );
}
