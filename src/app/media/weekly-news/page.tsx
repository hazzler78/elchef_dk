"use client";

import styled from 'styled-components';
import React from 'react';
import Link from 'next/link';

// Eleganta ikoner
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{marginRight: 12, flexShrink: 0, marginTop: 2}}>
    <polyline points="3,9 7,13 13,5" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" style={{marginRight: 8, flexShrink: 0, marginTop: 2}}>
    <path d="M6 4l4 4-4 4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" style={{marginRight: 8, flexShrink: 0, marginTop: 2}}>
    <path d="M8 1L15 14H1L8 1Z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{marginLeft: 10, flexShrink: 0, verticalAlign: 'middle'}}>
    <path d="M7 5l5 5-5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: 8, flexShrink: 0}}>
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Section = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;

const Lead = styled.p`
  font-size: 1.2rem;
  color: var(--gray-700);
  margin-bottom: 2rem;
`;

const Article = styled.article`
  margin-top: 2rem;
`;

const CustomList = styled.ul`
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
`;

const CustomListItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.2rem;
  font-size: 1.1rem;
  line-height: 1.7;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SubTitle = styled.h3`
  font-size: 1.3rem;
  margin: 2.5rem 0 1.5rem 0;
  color: var(--primary-dark);
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 2px;
  }
`;

const InfoBox = styled.div`
  background: linear-gradient(120deg, var(--primary) 60%, var(--primary-dark) 100%);
  color: white;
  box-shadow: var(--glass-shadow-heavy);
  border: 1.5px solid rgba(255,255,255,0.18);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  margin: 2rem 0;
  
  h4 {
    margin-bottom: 1rem;
    color: white;
  }
`;

const Quote = styled.blockquote`
  font-style: italic;
  color: var(--primary-dark);
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-weight: 600;
  background: rgba(255,255,255,0.6);
  border-radius: 0 12px 12px 0;
`;

const CTAButton = styled.a`
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  box-shadow: var(--glass-shadow-light);
  text-decoration: none;
  display: inline-block;
  margin-top: 1.5rem;
  
  &:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
    transform: translateY(-2px) scale(1.03);
    box-shadow: var(--glass-shadow-heavy);
  }
`;

const PageBackground = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(120deg, rgba(224,24,43,0.10) 0%, rgba(255,255,255,0.10) 100%);
  padding: 0;
`;

export default function WeeklyNews() {
  return (
    <PageBackground>
      <Section>
        <Container>
          <BackButton href="/media">
            <BackIcon />
            Tilbage til Medier
          </BackButton>
          
          <Title>Ugens nyheder fra elmarkedet</Title>
          <Lead>
            Her samler vi de seneste nyheder og opdateringer fra elmarkedet, der påvirker dig som forbruger. Vi holder dig opdateret med de vigtigste begivenheder, der kan påvirke din elaftale og energiforbrug.
          </Lead>

          <Article>
            <SubTitle>Seneste udvikling:</SubTitle>
            <CustomList>
              <CustomListItem>
                <ArrowRight />
                <div><strong>Nye elaftaler lanceres</strong> – flere leverandører har justeret deres priser for at konkurrere bedre.</div>
              </CustomListItem>
              <CustomListItem>
                <ArrowRight />
                <div><strong>Vindkraftudvidelse</strong> – nye vindmølleparker planlægges, hvilket kan presse priserne yderligere.</div>
              </CustomListItem>
              <CustomListItem>
                <ArrowRight />
                <div><strong>Reguleringsændringer</strong> – nye EU-direktiver påvirker, hvordan elpriserne skal præsenteres for forbrugere.</div>
              </CustomListItem>
              <CustomListItem>
                <WarningIcon />
                <div><strong>Vejrudsigter</strong> – de kommende uger forventes at have blandet vejr, hvilket kan påvirke prisvolatiliteten.</div>
              </CustomListItem>
            </CustomList>
            
            <SubTitle>🚨 Advarsel: Skjulte gebyrer og urimelige bindingsperioder</SubTitle>
            <p>
              Vi har opdaget nogle rigtig dårlige eksempler på, hvordan visse leverandører forsøger at snyde kunder:
            </p>
            <CustomList>
              <CustomListItem>
                <WarningIcon />
                <div><strong>Øresundskrafts &quot;flytteknus&quot;</strong> – 252 kroner bare fordi du flytter ind! Vi takker for skæmtet, men siger nej tak.</div>
              </CustomListItem>
              <CustomListItem>
                <WarningIcon />
                <div><strong>Lingons 60-måneders binding</strong> – længere end de fleste forhold holder! Godt vi nåede at gribe ind – ellers var det blevet 35 000 kroner i el-sorg.</div>
              </CustomListItem>
            </CustomList>
            
            <Quote>
              &quot;Nu har vi fået fuldmagt og spænder buen – pengene skal tilbage!&quot;
            </Quote>
            
            <SubTitle>💚 Elchef til undsætning</SubTitle>
            <CustomList>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Ingen flytteknus eller skjulte gebyrer</strong> – kun markedets bedste priser.</div>
              </CustomListItem>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Ingen urimelige bindingsperioder</strong> – du er fri til at skifte, når du vil.</div>
              </CustomListItem>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Personlig hjælp</strong> – efterlad dit telefonnummer, så ringer vi op og hjælper.</div>
              </CustomListItem>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Elens Robin Hood</strong> – vi tager kontakt og hjælper med alle spørgsmål og manuel registrering.</div>
              </CustomListItem>
            </CustomList>
            
            <Quote>
              &quot;Det er vigtigt at holde sig opdateret med markedsudviklingen for at træffe informerede beslutninger om din elaftale.&quot;
            </Quote>
            
            <SubTitle>Hvad betyder dette for dig?</SubTitle>
            <CustomList>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Bedre konkurrence</strong> – flere alternativer og potentielt lavere priser.</div>
              </CustomListItem>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Mere gennemsigtighed</strong> – tydeligere information om, hvad du faktisk betaler for.</div>
              </CustomListItem>
              <CustomListItem>
                <CheckIcon />
                <div><strong>Fleksibilitet</strong> – mulighed for at skifte til bedre aftaler, når markedet ændrer sig.</div>
              </CustomListItem>
            </CustomList>
            
            <InfoBox>
              <h4>Vil du være først med nyhederne?</h4>
              <p>Abonner på vores nyhedsbrev for at få de seneste opdateringer direkte i din indbakke.</p>
              <CustomList>
                <CustomListItem>
                  <CheckIcon />
                  <div>Vi underretter dig, når din aftale udløber</div>
                </CustomListItem>
                <CustomListItem>
                  <CheckIcon />
                  <div>Vi underretter dig, når en ny kampagne er tilgængelig</div>
                </CustomListItem>
                <CustomListItem>
                  <CheckIcon />
                  <div>Vi underretter dig, når det er tid at skifte for at undgå dyrere el</div>
                </CustomListItem>
                <CustomListItem>
                  <CheckIcon />
                  <div>Ugentlig sammenfatning af markedsudviklingen</div>
                </CustomListItem>
                <CustomListItem>
                  <CheckIcon />
                  <div>Eksklusive tilbud til abonnenter</div>
                </CustomListItem>
              </CustomList>
            </InfoBox>
            
            <SubTitle>Kommende begivenheder at holde øje med:</SubTitle>
            <CustomList>
              <CustomListItem>
                <ArrowRight />
                <div><strong>Næste uge:</strong> Ny rapport om energisparetips til vintermånederne.</div>
              </CustomListItem>
              <CustomListItem>
                <ArrowRight />
                <div><strong>Om to uger:</strong> Lancering af ny prissammenligningtjeneste med realtidsdata.</div>
              </CustomListItem>
              <CustomListItem>
                <ArrowRight />
                <div><strong>Månedens slutning:</strong> Kvartalsrapport fra energimyndigheden om markedsudviklingen.</div>
              </CustomListItem>
            </CustomList>
            
            <InfoBox>
              <h4>☀️ Nyd solen – og tip gerne venner og familie!</h4>
              <p>
                Tip gerne venner og familie om Elchef, så de slipper for månedsgebyrer og dyre tillæg på elregningen. 
                Elregningen skal være som sommeren: lys, let – og ikke ruinere dig.
              </p>
            </InfoBox>
            
            <div style={{ textAlign: 'center' }}>
              <CTAButton 
                href="https://elchef.dk" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Opdag dine muligheder på elchef.dk <ArrowIcon />
              </CTAButton>
            </div>
          </Article>
        </Container>
      </Section>
    </PageBackground>
  );
}
