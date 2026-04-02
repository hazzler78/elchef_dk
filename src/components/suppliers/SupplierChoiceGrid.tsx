'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import type { PublicSupplier, PublicSupplierContractFilter } from '@/lib/publicSuppliers';
import { withDefaultCtaUtm, withUtm } from '@/lib/utm';

const Section = styled.section<{ $theme: 'light' | 'glass' }>`
  margin-top: ${(p) => (p.$theme === 'light' ? '0' : '0')};
  margin-bottom: ${(p) => (p.$theme === 'light' ? '2rem' : '2rem')};
`;

const Headline = styled.h2<{ $theme: 'light' | 'glass' }>`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-align: center;
  color: ${(p) => (p.$theme === 'light' ? '#111827' : 'white')};
  text-shadow: ${(p) => (p.$theme === 'glass' ? '0 2px 4px rgba(0,0,0,0.12)' : 'none')};
`;

const Intro = styled.p<{ $theme: 'light' | 'glass' }>`
  font-size: 1rem;
  line-height: 1.55;
  margin: 0 auto 1.25rem auto;
  max-width: 640px;
  text-align: center;
  color: ${(p) => (p.$theme === 'light' ? '#374151' : 'rgba(255,255,255,0.92)')};
  text-shadow: ${(p) => (p.$theme === 'glass' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none')};
`;

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div<{ $theme: 'light' | 'glass' }>`
  border-radius: 16px;
  padding: 1.25rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  border: 1px solid
    ${(p) =>
      p.$theme === 'light' ? 'rgba(255, 255, 255, 0.25)' : 'var(--glass-border, rgba(255,255,255,0.2))'};
  background: ${(p) =>
    p.$theme === 'light'
      ? 'rgba(255, 255, 255, 0.96)'
      : 'var(--glass-bg, rgba(255, 255, 255, 0.12))'};
  backdrop-filter: ${(p) => (p.$theme === 'glass' ? 'var(--glass-blur, blur(12px))' : 'blur(8px)')};
  -webkit-backdrop-filter: ${(p) =>
    p.$theme === 'glass' ? 'var(--glass-blur, blur(12px))' : 'blur(8px)'};
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary, #e0182b);
`;

const PriceLine = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #4b5563;
`;

const Notes = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
  color: #374151;
`;

const CtaRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
`;

const ctaPrimaryStyles = css`
  display: block;
  text-align: center;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  }
`;

const Cta = styled(Link)`
  ${ctaPrimaryStyles}
`;

const CtaExternal = styled.a`
  ${ctaPrimaryStyles}
`;

const SecondaryCta = styled(Link)`
  display: block;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--primary, #e0182b);
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(224, 24, 43, 0.25);
`;

function formatOre(m: number): string {
  if (!Number.isFinite(m)) return '0';
  if (Math.abs(m - Math.round(m)) < 1e-6) return String(Math.round(m));
  return m.toLocaleString('da-DK', { maximumFractionDigits: 2 });
}

function rowContractType(
  s: PublicSupplier,
  pageContract?: PublicSupplierContractFilter
): PublicSupplierContractFilter {
  if (pageContract) return pageContract;
  if (!s.offers_variabel && s.offers_fastpris) return 'fastpris';
  return 'variabel';
}

function partnerSignupUrl(s: PublicSupplier, contractType: PublicSupplierContractFilter): string | null {
  if (contractType === 'fastpris') {
    return s.fastpris_signup_url || s.signup_url;
  }
  return s.signup_url;
}

function pricingSummary(s: PublicSupplier, contractType: PublicSupplierContractFilter): string {
  const ore = s.markup_ore_per_kwh;
  const fee = s.monthly_fee_dkk;
  const feePart =
    fee > 0
      ? `${fee.toLocaleString('da-DK', { maximumFractionDigits: 2 })} kr. pr. måned i abonnement`
      : '0 kr. i månedsgebyr';

  if (contractType === 'fastpris') {
    const spotRef =
      ore > 0
        ? `Spot-reference: ${formatOre(ore)} øre/kWh tillæg`
        : ore < 0
          ? `Spot-reference: ${formatOre(ore)} øre/kWh rabat`
          : null;
    const mid = spotRef ? `${spotRef} · ` : '';
    return `Fastprisaftale — fast kWh-pris aftales hos leverandøren. ${mid}${feePart}`;
  }

  const orePart =
    ore > 0
      ? `${formatOre(ore)} øre/kWh i tillæg til spot`
      : ore < 0
        ? `${formatOre(ore)} øre/kWh under spot (rabat)`
        : '0 øre i tillæg pr. kWh';
  return `${orePart} · ${feePart}`;
}

export type SupplierChoiceGridProps = {
  suppliers: PublicSupplier[];
  /**
   * Når sat (fx variabel- eller fastpris-side), bruges samme type for alle kort.
   * Udeladt (fx sammenlign): per leverandør — kun fastpris hvis de ikke tilbyder variabel.
   */
  contractType?: PublicSupplierContractFilter;
  ctaMedium: string;
  theme?: 'light' | 'glass';
  headline?: string;
  intro?: string;
  compact?: boolean;
};

export function SupplierChoiceGrid({
  suppliers,
  contractType,
  ctaMedium,
  theme = 'light',
  headline = 'Vores samarbejdspartnere',
  intro = 'Vælg den elleverandør, der passer dig — vi hjælper dig videre med sammenligning og gratis skift.',
  compact = false,
}: SupplierChoiceGridProps) {
  if (!suppliers.length) return null;

  return (
    <Section $theme={theme} aria-labelledby="supplier-choice-heading">
      {!compact && (
        <>
          <Headline id="supplier-choice-heading" $theme={theme}>
            {headline}
          </Headline>
          <Intro $theme={theme}>{intro}</Intro>
        </>
      )}
      <Grid>
        {suppliers.map((s) => {
          const ct = rowContractType(s, contractType);
          const compareHref = withDefaultCtaUtm(
            '/sammenlign-elpriser',
            ctaMedium,
            s.name,
            `supplier-${encodeURIComponent(s.name)}`
          );
          const skiftHref = withDefaultCtaUtm(
            '/skift-elaftale',
            ctaMedium,
            s.name,
            `supplier-skift-${encodeURIComponent(s.name)}`
          );
          const rawPartner = partnerSignupUrl(s, ct);
          const partnerHref = rawPartner
            ? withUtm(rawPartner, {
                utm_medium: ctaMedium,
                utm_campaign:
                  ct === 'fastpris'
                    ? `supplier-fp-${encodeURIComponent(s.name)}`
                    : `supplier-${encodeURIComponent(s.name)}`,
                utm_content: s.name,
              })
            : null;
          return (
            <Card key={s.id} $theme={theme}>
              <Name>{s.name}</Name>
              <PriceLine>{pricingSummary(s, ct)}</PriceLine>
              {s.notes ? <Notes>{s.notes}</Notes> : null}
              <CtaRow>
                {partnerHref ? (
                  <>
                    <CtaExternal href={partnerHref} target="_blank" rel="noopener noreferrer">
                      {ct === 'fastpris'
                        ? `Fastpris hos ${s.name} (åbner partnerside)`
                        : `Skift hos ${s.name} (åbner partnerside)`}
                    </CtaExternal>
                    <SecondaryCta href={compareHref}>Sammenlign elregning med AI</SecondaryCta>
                    <SecondaryCta href={skiftHref}>Overblik: skift elaftale på Elchef</SecondaryCta>
                  </>
                ) : (
                  <>
                    <Cta href={compareHref}>Sammenlign og vælg</Cta>
                    <SecondaryCta href={skiftHref}>Gå til skift af aftale</SecondaryCta>
                  </>
                )}
              </CtaRow>
            </Card>
          );
        })}
      </Grid>
    </Section>
  );
}

const LoadingText = styled.p<{ $glass?: boolean }>`
  text-align: center;
  color: ${(p) => (p.$glass ? 'rgba(255,255,255,0.85)' : '#64748b')};
  font-size: 0.95rem;
  margin: 1rem 0;
`;

export function SupplierChoiceGridAuto(
  props: Omit<SupplierChoiceGridProps, 'suppliers'> & { suppliers?: PublicSupplier[] }
) {
  const { suppliers: initial, ...rest } = props;
  const [rows, setRows] = useState<PublicSupplier[] | null>(() =>
    initial && initial.length > 0 ? initial : null
  );

  useEffect(() => {
    if (initial && initial.length > 0) {
      setRows(initial);
      return;
    }
    let cancelled = false;
    const aftale =
      rest.contractType === 'fastpris' || rest.contractType === 'variabel'
        ? `?aftale=${rest.contractType}`
        : '';
    fetch(`/api/public/suppliers${aftale}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PublicSupplier[]) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [initial, rest.contractType]);

  if (rows === null) {
    return <LoadingText $glass={rest.theme === 'glass'}>Indlæser elleverandører…</LoadingText>;
  }

  if (!rows.length) return null;

  return <SupplierChoiceGrid suppliers={rows} {...rest} />;
}
