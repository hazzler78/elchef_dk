"use client";

import styled from 'styled-components';
import React from 'react';

// Ikon-komponenter
const BlueDot = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{marginRight: 10, flexShrink: 0}}>
    <circle cx="6" cy="6" r="5" fill="var(--primary)" />
  </svg>
);
const GreenDot = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{marginRight: 10, flexShrink: 0}}>
    <circle cx="6" cy="6" r="5" fill="var(--secondary)" />
  </svg>
);
const RedDot = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{marginRight: 10, flexShrink: 0}}>
    <circle cx="6" cy="6" r="5" fill="#ef4444" />
  </svg>
);
const GreenCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{marginRight: 10, flexShrink: 0}}>
    <polyline points="3,9 7,13 13,5" fill="none" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: 10, flexShrink: 0, verticalAlign: 'middle'}}>
    <rect width="24" height="24" rx="6" fill="#FF0000"/>
    <polygon points="10,8 16,12 10,16" fill="#fff" />
  </svg>
);

const NewspaperIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: 10, flexShrink: 0, verticalAlign: 'middle'}}>
    <rect x="3" y="5" width="18" height="14" rx="3" fill="var(--primary)"/>
    <rect x="6" y="8" width="8" height="2" rx="1" fill="#fff"/>
    <rect x="6" y="12" width="5" height="2" rx="1" fill="#fff"/>
    <rect x="13" y="12" width="5" height="2" rx="1" fill="#fff"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{marginLeft: 10, flexShrink: 0, verticalAlign: 'middle'}}>
    <path d="M7 5l5 5-5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Section = styled.section`
  padding: var(--section-spacing) 0;
  background: var(--gray-50);
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 3rem 2rem;
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
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-200);
`;

const ArticleTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--gray-700);
`;

const SubTitle = styled.h3`
  font-size: 1.3rem;
  margin: 2rem 0 1rem 0;
  color: var(--gray-700);
`;

const VideoBox = styled.div`
  background: var(--gray-100);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const CustomList = styled.ul`
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
`;
const CustomListItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  font-size: 1.08rem;
  line-height: 1.6;
`;

const Quote = styled.blockquote`
  font-style: italic;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-weight: 600;
`;

const InfoBox = styled.div`
  background: var(--primary);
  color: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin: 1.5rem 0;
  
  h4 {
    margin-bottom: 1rem;
    color: white;
  }
`;

const CTAButton = styled.a`
  background: var(--primary);
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  text-decoration: none;
  display: inline-block;
  margin-top: 1.5rem;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const YouTubeButton = styled.a`
  background: #ff0000;
  color: white;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #cc0000;
    transform: translateY(-1px);
  }
`;

const HallandspostenLink = styled.a`
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
`;

export default function Media() {
  return (
    <Section>
      <Container>
        <Title>Media</Title>
        <Lead>
          <b>Vi arbetar aktivt med att sprida kunskap om energibesparing och hållbara elavtal.</b>
        </Lead>
        <p>
          Läs mer om vårt arbete och våra senaste nyheter, eller upptäck våra rapporter och analyser om elmarknaden.
        </p>
        
        <Article>
          <ArticleTitle>Så påverkar vädret elpriset – förklarat på ett enkelt sätt</ArticleTitle>
          <p>
            Elpriset svänger hela tiden – och vädret är en av de viktigaste faktorerna. På sommaren är priserna ofta lägre, men variationerna styrs ändå av regn, vind och temperatur.
          </p>
          <VideoBox>
            <p>
              I det här klippet från <b>Tidslinjen Podcast</b> får du en lättförståelig genomgång:
            </p>
            <YouTubeButton 
              href="https://www.youtube.com/watch?v=upV45wGq1xM" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <YouTubeIcon />
              Se klippet på YouTube
            </YouTubeButton>
          </VideoBox>
          <SubTitle>Kort – så styr vädret elpriset:</SubTitle>
          <CustomList>
            <CustomListItem><GreenDot /> <b>Regn → lägre pris</b><span style={{marginLeft: 4}}>Fyller vattenmagasin i norr – billig vattenkraft.</span></CustomListItem>
            <CustomListItem><GreenDot /> <b>Vind → lägre pris</b><span style={{marginLeft: 4}}>Mycket vindkraftproduktion pressar priset.</span></CustomListItem>
            <CustomListItem><GreenDot /> <b>Värme → ofta lägre pris</b><span style={{marginLeft: 4}}>Mindre efterfrågan på uppvärmning.</span></CustomListItem>
            <CustomListItem><RedDot /> <b>Torka eller vindstilla → högre pris</b><span style={{marginLeft: 4}}>Mindre billig el – vi importerar dyrare el.</span></CustomListItem>
          </CustomList>
          <Quote>
            Tänk på rörligt elpris som bensinpriset – det varierar med tillgång och efterfrågan.
          </Quote>
          <SubTitle>Sommaren är perfekt för att säkra ett bra elavtal</SubTitle>
          <CustomList>
            <CustomListItem><GreenCheck /> Många vill låsa in låga sommarpriser inför hösten.</CustomListItem>
            <CustomListItem><GreenCheck /> Hos oss elchef.se får du <b>rörligt pris utan påslag</b> – bara marknadspriset.</CustomListItem>
            <CustomListItem><GreenCheck /> Vi visar även fasta elavtal för dig som vill slippa prischocker.</CustomListItem>
          </CustomList>
          <InfoBox>
            <h4>Bytet är alltid gratis och enkelt:</h4>
            <CustomList>
              <CustomListItem><BlueDot /> Helt digitalt.</CustomListItem>
              <CustomListItem><BlueDot /> Vi fixar uppsägningen hos ditt gamla elbolag.</CustomListItem>
              <CustomListItem><BlueDot /> Inga papper eller samtal.</CustomListItem>
              <CustomListItem><BlueDot /> Klart på 14 dagar.</CustomListItem>
            </CustomList>
          </InfoBox>
          <div style={{ textAlign: 'center' }}>
            <CTAButton 
              href="https://elchef.se" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Redo att fixa bästa elavtalet? Byt direkt på elchef.se <ArrowIcon />
            </CTAButton>
          </div>
        </Article>

        <Article>
          <ArticleTitle>Han vill ha billigare el åt folket</ArticleTitle>
          <p>
            Många är trötta på krångliga elavtal, dolda avgifter och dyra mellanhänder. I den här artikeln i Hallandsposten berättar elchef.se:s grundare om sin idé: att <b>göra elmarknaden mer rättvis och ge billigare el åt alla</b>.
          </p>
          <VideoBox>
            <HallandspostenLink
              href="https://www.hallandsposten.se/hallands-affarer/han-vill-ha-billigare-el-at-folket.857df3f6-83cd-495c-b0bb-8f44359758e3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <NewspaperIcon />
              Läs artikeln i Hallandsposten
            </HallandspostenLink>
          </VideoBox>
          <SubTitle>Elchef.se vill göra skillnad:</SubTitle>
          <CustomList>
            <CustomListItem><GreenCheck /> <b>Inga dolda påslag eller avgifter</b> – du ser det riktiga priset.</CustomListItem>
            <CustomListItem><GreenCheck /> <b>Full valfrihet</b> – välj mellan rörligt eller fast pris på ett ställe.</CustomListItem>
            <CustomListItem><GreenCheck /> <b>Kostnadsfritt att byta</b> – vi sköter allt åt dig.</CustomListItem>
            <CustomListItem><GreenCheck /> <b>Transparens och enkelhet</b> – så att alla kan fatta bra beslut.</CustomListItem>
          </CustomList>
          <SubTitle>Sommaren – bästa tiden att byta elavtal</SubTitle>
          <p>
            Just nu är elpriserna ofta lägre tack vare:
          </p>
          <CustomList>
            <CustomListItem><GreenDot /> Fyllda vattenmagasin efter vårfloden.</CustomListItem>
            <CustomListItem><GreenDot /> Mycket vindkraftproduktion.</CustomListItem>
            <CustomListItem><GreenDot /> Lägre efterfrågan på uppvärmning.</CustomListItem>
          </CustomList>
          <p>
            Smart att teckna rörligt pris till sommarprisnivå.<br />
            Eller välja fast pris och slippa höstrusket i plånboken.
          </p>
          <SubTitle>Därför ska du byta med elchef.se</SubTitle>
          <CustomList>
            <CustomListItem><GreenCheck /> Helt digitalt – inga papper eller samtal.</CustomListItem>
            <CustomListItem><GreenCheck /> Vi säger upp ditt gamla avtal åt dig.</CustomListItem>
            <CustomListItem><GreenCheck /> <b>14 dagar från signering till start – börja planera redan nu.</b></CustomListItem>
            <CustomListItem><GreenCheck /> Alltid marknadens bästa översikt – så du slipper leta själv.</CustomListItem>
          </CustomList>
          <div style={{ textAlign: 'center' }}>
            <CTAButton 
              href="https://elchef.se" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Redo att hitta bästa elavtalet? Byt enkelt på elchef.se <ArrowIcon />
            </CTAButton>
          </div>
        </Article>
      </Container>
    </Section>
  );
} 