"use client";
import styled from "styled-components";

const Banner = styled.div`
  width: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
  color: #1f2937;
  text-align: center;
  padding: 1.2rem 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  z-index: 2000;
  position: relative;
`;

const Highlight = styled.span`
  color: #2563eb;
  background: #fffbe6;
  padding: 0.1em 0.4em;
  border-radius: 0.4em;
  margin: 0 0.2em;
`;

const StyledLink = styled.a`
  color: #2563eb;
  margin: 0 0.2em;
  text-decoration: underline;
  font-weight: 700;
`;

export default function CampaignBanner() {
  return (
    <Banner>
      🎉 Vi skänker bort el för <Highlight>1 miljon kronor!</Highlight>
      Alla som registrerar sig för
      <StyledLink href="https://www.svekraft.com/elchef-rorligt/" target="_blank" rel="noopener noreferrer">Rörligt avtal</StyledLink>
      får <Highlight>500 kr rabatt</Highlight> med koden <Highlight>Elchef500</Highlight>!
    </Banner>
  );
} 