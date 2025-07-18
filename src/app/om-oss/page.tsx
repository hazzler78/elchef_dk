"use client";

import styled from 'styled-components';
import GlassButton from '@/components/GlassButton';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.8);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
`;
const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: #2563eb;
`;
const Lead = styled.p`
  font-size: 1.2rem;
  color: #374151;
  margin-bottom: 2rem;
`;
const List = styled.ul`
  margin-bottom: 2rem;
  li {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }
`;
const Quote = styled.blockquote`
  font-style: italic;
  color: #2563eb;
  border-left: 4px solid #2563eb;
  padding-left: 1rem;
  margin: 2rem 0;
`;
const CTA = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

export default function OmOss() {
  return (
    <Section>
      <Container>
        <Title>Om oss</Title>
        <Lead>
          <b>Elchef.se gör det enkelt att välja rätt elavtal – snabbt, gratis och utan krångel.</b>
        </Lead>
        <p>
          Vi är en oberoende jämförelsetjänst som hjälper svenska hushåll att <b>sänka elkostnaden</b> och få bättre koll på elmarknaden. Oavsett om du bor i lägenhet eller villa, hyr eller äger, så kan du med några klick hitta det bästa elavtalet för just dig.
        </p>
        <List>
          <li><b>Marknadens tydligaste översikt</b> över elavtal – helt utan reklam eller dolda intressen.</li>
          <li><b>Gratis byte av elavtal</b> – vi tar hand om allt, inklusive uppsägning hos ditt gamla bolag.</li>
          <li><b>Avtalsfrihet utan bindningstid</b> – du kan byta igen när du vill.</li>
        </List>
        <p>
          Vi tycker inte att el ska kännas krångligt. Därför förklarar vi allt på <b>enkelt och begripligt språk</b> – från rörligt pris till elområden och miljöpåverkan. Tänk på oss som din <b>smarta kompis på elmarknaden</b>, som alltid vill att du ska få det bästa.
        </p>
        <Quote>
          Vårt mål är att alla hushåll i Sverige ska känna sig trygga, välinformerade och aldrig betala mer än nödvändigt för sin el.
        </Quote>
        <p>
          Vill du slippa onödigt dyra elavtal? Börja jämföra och byt direkt via Elchef – det tar bara några minuter.
        </p>
        <CTA>
          <GlassButton 
            variant="primary" 
            size="lg" 
            onClick={() => window.open('/', '_self')}
            background={'linear-gradient(135deg, rgba(0,201,107,0.95), rgba(22,147,255,0.95))'}
          >
            Se ditt pris nu
          </GlassButton>
        </CTA>
      </Container>
    </Section>
  );
} 