"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const Nav = styled.nav<{ offset?: number }>`
  position: fixed;
  bottom: ${(props) => (props.offset ? `${props.offset}px` : '0')};
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  box-shadow: var(--glass-shadow-light);
  z-index: 1003 !important;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.5rem;
  position: relative;
  transition: color 0.3s ease;
  
  &.active {
    color: var(--primary);
  }
  
  &:hover {
    color: var(--primary);
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: -0.25rem;
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 201, 107, 0.5);
`;

function BottomNavContent() {
  const pathname = usePathname();
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const selectCookieBannerElement = (): HTMLElement | null => {
      // Cookiebot commonly injects these IDs/classes; try a few sensible selectors
      const candidates = [
        '#CybotCookiebotDialog',
        '[id^="CybotCookiebot"]',
        '#CookiebotDialog',
        '.CookieConsent',
        '.CookiebotWidget',
        '#CookieConsent',
        '#CookieDeclaration',
        '.cookieconsent',
        '.cookie-declaration',
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[id*="Cookie"]',
        '[class*="Cookie"]',
      ];
      for (const selector of candidates) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) return el;
      }
      return null;
    };

    const isElementVisible = (el: HTMLElement): boolean => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    };

    const updateOffset = () => {
      try {
        const banner = selectCookieBannerElement();
        if (banner && isElementVisible(banner)) {
          const rect = banner.getBoundingClientRect();
          // Check if banner is at bottom or overlapping with bottom area
          const isAtBottom = Math.abs(window.innerHeight - rect.bottom) < 10;
          const isOverlappingBottom = rect.bottom > window.innerHeight - 100; // 100px from bottom
          
          if (isAtBottom || isOverlappingBottom) {
            // Add extra padding to ensure nav is clearly above cookie banner
            setBottomOffset(Math.ceil(rect.height) + 20);
          } else {
            setBottomOffset(0);
          }
        } else {
          setBottomOffset(0);
        }
      } catch {
        setBottomOffset(0);
      }
    };

    // Initial check
    updateOffset();

    // Recalculate on resize and orientation changes
    const handleResize: EventListener = () => updateOffset();
    const handleOrientationChange: EventListener = () => updateOffset();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Observe DOM mutations to detect when Cookiebot injects/hides the banner
    const observer = new MutationObserver(() => updateOffset());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    // Also poll as a fallback (Cookiebot may animate in)
    const interval = window.setInterval(updateOffset, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);
  
  return (
    <Nav offset={bottomOffset}>
      <NavItem href="/" className={pathname === '/' ? 'active' : ''}>
        Hem
        {pathname === '/' && <ActiveIndicator />}
      </NavItem>
      <NavItem href="/jamfor-elpriser" className={pathname === '/jamfor-elpriser' ? 'active' : ''}>
        Jämför
        {pathname === '/jamfor-elpriser' && <ActiveIndicator />}
      </NavItem>
      <NavItem href="/media" className={pathname === '/media' ? 'active' : ''}>
        Media
        {pathname === '/media' && <ActiveIndicator />}
      </NavItem>
      <NavItem href="/foretag" className={pathname === '/foretag' ? 'active' : ''}>
        Företag
        {pathname === '/foretag' && <ActiveIndicator />}
      </NavItem>
      <NavItem href="/om-oss" className={pathname === '/om-oss' ? 'active' : ''}>
        Om oss
        {pathname === '/om-oss' && <ActiveIndicator />}
      </NavItem>
    </Nav>
  );
}

export default function BottomNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <BottomNavContent />;
} 