"use client";

import styled from 'styled-components';
import Link from 'next/link';
import { withDefaultCtaUtm } from '@/lib/utm';
import { FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const FooterWrapper = styled.div`
  background: var(--gray-700);
  color: white;
  padding: 4rem 0 2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
`;

const FooterColumn = styled.div`
  h3 {
    color: white;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.75rem;
  }

  a {
    color: var(--gray-300);
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  p {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-300);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  a {
    color: var(--gray-300);
    font-size: 1.5rem;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }
`;

const BottomBar = styled.div`
  border-top: 1px solid var(--gray-600);
  padding-top: 2rem;
  text-align: center;
  color: var(--gray-300);
  font-size: 0.875rem;
`;

export default function Footer() {
  return (
    <FooterWrapper>
      <div className="container">
        <FooterGrid>
          <FooterColumn>
            <h3>Om Elchef</h3>
            <p style={{ color: 'var(--gray-300)', marginBottom: '1rem' }}>
              Vi hjælper dig med at finde og skifte til markedets bedste elaftale. 
              Nemt, trygt og helt gratis.
            </p>
            <ContactInfo>
              <p>
                <FaPhone /> +45 XX XX XX XX
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>
                  09:00-13:00 Hverdage
                </span>
              </p>
              <p>
                <FaEnvelope /> info@elchef.dk
              </p>
            </ContactInfo>
            <SocialLinks>
              <Link href="https://www.facebook.com/profile.php?id=61575315383990">
                <FaFacebook />
              </Link>
              <Link href="https://instagram.com/elchef">
                <FaInstagram />
              </Link>
              <Link href="https://linkedin.com/company/elchef">
                <FaLinkedin />
              </Link>
            </SocialLinks>
          </FooterColumn>

          <FooterColumn>
            <h3>Tjenester</h3>
            <ul>
              <li><Link href={withDefaultCtaUtm('/skift-elaftale', 'footer', 'services-byt')}>Skift elaftale</Link></li>
              <li><Link href={withDefaultCtaUtm('/faktura-analyse', 'footer', 'services-jamfor')}>Fakturaanalyse</Link></li>
              <li><Link href={withDefaultCtaUtm('/elpriskollen', 'footer', 'services-elpriskollen')}>Elpriskollen</Link></li>
              <li><Link href={withDefaultCtaUtm('/energiradgivning', 'footer', 'services-energiradgivning')}>Energirådgivning</Link></li>
              <li><Link href={withDefaultCtaUtm('/erhverv', 'footer', 'services-foretag')}>Erhverv</Link></li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h3>Information</h3>
            <ul>
              <li><Link href={withDefaultCtaUtm('/om-os', 'footer', 'info-om-oss')}>Om os</Link></li>
              <li><Link href={withDefaultCtaUtm('/ofte-stillede-sporgsmal', 'footer', 'info-faq')}>Ofte stillede spørgsmål</Link></li>
              <li><Link href={withDefaultCtaUtm('/kontakt', 'footer', 'info-kontakt')}>Kontakt</Link></li>
              <li><Link href={withDefaultCtaUtm('/media', 'footer', 'info-media')}>Medier</Link></li>
              <li><Link href={withDefaultCtaUtm('/partner', 'footer', 'info-partner')}>Partner</Link></li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h3>Juridisk</h3>
            <ul>
              <li><Link href={withDefaultCtaUtm('/vilkar', 'footer', 'legal-villkor')}>Brugervilkår</Link></li>
              <li><Link href={withDefaultCtaUtm('/privatlivspolitik', 'footer', 'legal-integritet')}>Privatlivspolitik</Link></li>
              <li><Link href={withDefaultCtaUtm('/cookies', 'footer', 'legal-cookies')}>Cookies</Link></li>
              <li><Link href={withDefaultCtaUtm('/gdpr', 'footer', 'legal-gdpr')}>GDPR</Link></li>
            </ul>
          </FooterColumn>
        </FooterGrid>

        <BottomBar>
          <p>© 2025 Elchef.dk. Alle rettigheder forbeholdes.</p>
        </BottomBar>
      </div>
    </FooterWrapper>
  );
} 