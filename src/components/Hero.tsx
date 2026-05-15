/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import styled from 'styled-components';
import React, { useEffect, useState, useCallback } from 'react';
import { withDefaultCtaUtm } from '@/lib/utm';

const HeroSection = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
  overflow: hidden;
  position: relative;
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    align-items: center;
    justify-content: space-between;
  }
`;

const TextContent = styled.div`
  flex: 1;
  max-width: 600px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1.25rem;
    color: white;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

    @media (min-width: 768px) {
      font-size: 3.25rem;
    }
  }

  p {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.92);
    margin-bottom: 1.75rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    max-width: 32rem;
  }
`;

const PrimaryCta = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: min(100%, 280px);
  padding: 1rem 2rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1c1917;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  background: var(--cta-gradient);
  box-shadow: var(--cta-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
    box-shadow: 0 16px 40px rgba(234, 88, 12, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CtaHint = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
`;

const FastprisLink = styled.a`
  color: #fde68a;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: #fef3c7;
  }
`;

const VideoWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--glass-shadow-heavy);
  max-width: 420px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const USPList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.75rem 0 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.05rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
`;

export default function Hero() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('hero_variant_v1') : null;
      const storedExpiry = typeof window !== 'undefined' ? window.localStorage.getItem('hero_variant_expiry_v1') : null;
      const now = Date.now();
      const isExpired = storedExpiry ? now > Number(storedExpiry) : true;
      if (stored && (stored === 'A' || stored === 'B') && !isExpired) {
        setVariant(stored as 'A' | 'B');
        return;
      }
      const newVariant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
      const expiry = now + 30 * 24 * 60 * 60 * 1000;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hero_variant_v1', newVariant);
        window.localStorage.setItem('hero_variant_expiry_v1', String(expiry));
      }
      setVariant(newVariant);
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = `hero_impression_${variant}`;
      const last = Number(window.localStorage.getItem(key) || '0');
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      if (!last || now - last > dayMs) {
        const sessionId = window.localStorage.getItem('invoice_session_id') || '';
        const payload = JSON.stringify({ variant, sessionId });
        const url = '/api/events/hero-impression';
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
        }
        window.localStorage.setItem(key, String(now));
      }
    } catch {
      /* no-op */
    }
  }, [variant]);

  const heroTitle =
    variant === 'A' ? 'Elchef gør det nemt at vælge den rette elaftale!' : 'Vælg den rette elaftale – uden besvær';
  const heroSub =
    variant === 'A'
      ? 'Vi fremhæver aftaler, der er værd at overveje, og tager os af skiftet for dig.'
      : 'Hurtigt, gratis og trygt. Vi hjælper dig hele vejen.';

  const goToVariabel = useCallback(() => {
    try {
      const sessionId = typeof window !== 'undefined' ? window.localStorage.getItem('invoice_session_id') || '' : '';
      const sid = sessionId;
      const href = '/variabel-aftale' + (sid ? `?sid=${encodeURIComponent(sid)}` : '');
      const finalUrl = withDefaultCtaUtm(href, 'hero', `variant${variant}`, 'hero-ab');
      const payload = JSON.stringify({ variant, sessionId, target: 'rorligt', href: finalUrl });
      const url = '/api/events/hero-click';
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
      }

      try {
        const ttq: any = (window as any).ttq;
        const cookiebot: any = (window as any).cookiebot || (window as any).Cookiebot || (window as any).CookieControl;
        if (ttq && (!cookiebot || cookiebot?.consent?.marketing)) {
          ttq.track('ClickButton', { content_name: 'hero_primary_cta', content_type: 'button' });
          ttq.track('InitiateCheckout', { content_name: 'rorligt_avtal_click' });
          if ((window as any).__ttq_capi) {
            (window as any).__ttq_capi('InitiateCheckout', { content_name: 'rorligt_avtal_click' });
          }
        }
      } catch {
        /* no-op */
      }

      window.location.href = finalUrl;
    } catch {
      window.location.href = '/variabel-aftale';
    }
  }, [variant]);

  return (
    <HeroSection>
      <div className="container">
        <HeroContent>
          <TextContent>
            <h1>{heroTitle}</h1>
            <p>{heroSub}</p>
            <div>
              <PrimaryCta type="button" onClick={goToVariabel} aria-label="Kom i gang – vælg variabel elaftale">
                Kom i gang – vælg elaftale
              </PrimaryCta>
              <CtaHint>
                Foretrækker du fast pris?{' '}
                <FastprisLink href="/fastpris-aftale">Se fastprisaftaler her</FastprisLink>
              </CtaHint>
            </div>
            <USPList>
              <li>✔️ Gratis skift – vi opsiger din gamle aftale</li>
              <li>✔️ Klare priser uden skjulte gebyrer</li>
              <li>✔️ Du vælger variabel eller fastpris, når du er klar</li>
            </USPList>
          </TextContent>
          <VideoWrapper>
            <img
              src="/grisen.png"
              alt="Grisleif – Elchef maskot"
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </VideoWrapper>
        </HeroContent>
      </div>
    </HeroSection>
  );
}
