"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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
  &.active {
    color: #3b82f6;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: -0.25rem;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
`;

function BottomNavContent() {
  const pathname = usePathname();
  
  return (
    <Nav>
      <NavItem href="/" className={pathname === '/' ? 'active' : ''}>
        Hem
        {pathname === '/' && <ActiveIndicator />}
      </NavItem>
      <NavItem href="/jamfor-elpriser" className={pathname === '/jamfor-elpriser' ? 'active' : ''}>
        Jämför
        {pathname === '/jamfor-elpriser' && <ActiveIndicator />}
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <BottomNavContent />;
} 