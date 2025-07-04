"use client";

import styled from 'styled-components';

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

const WeatherList = styled.ul`
  margin: 1.5rem 0;
  list-style: none;
  
  li {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    position: relative;
    
    &:before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--secondary);
      font-weight: bold;
    }
    
    &.negative:before {
      color: #ef4444;
    }
  }
`;

const CheckList = styled.ul`
  margin: 1.5rem 0;
  list-style: none;
  
  li {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: flex-start;
    
    &:before {
      content: "✅";
      margin-right: 0.5rem;
      color: var(--secondary);
    }
  }
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
  
  ul {
    list-style: none;
    
    li {
      margin-bottom: 0.5rem;
      padding-left: 1rem;
      position: relative;
      
      &:before {
        content: "•";
        position: absolute;
        left: 0;
      }
    }
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
  display: inline-block;
  
  &:hover {
    background: #cc0000;
    transform: translateY(-1px);
  }
`;

const Quote = styled.blockquote`
  font-style: italic;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-weight: 600;
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
              🎥 Se klippet på YouTube
            </YouTubeButton>
          </VideoBox>

          <SubTitle>Kort – så styr vädret elpriset:</SubTitle>
          
          <WeatherList>
            <li>
              <b>Regn → lägre pris</b><br />
              Fyller vattenmagasin i norr → billig vattenkraft.
            </li>
            <li>
              <b>Vind → lägre pris</b><br />
              Mycket vindkraftproduktion pressar priset.
            </li>
            <li>
              <b>Värme → ofta lägre pris</b><br />
              Mindre efterfrågan på uppvärmning.
            </li>
            <li className="negative">
              <b>Torka eller vindstilla → högre pris</b><br />
              Mindre billig el → vi importerar dyrare el.
            </li>
          </WeatherList>

          <Quote>
            Tänk på rörligt elpris som bensinpriset – det varierar med tillgång och efterfrågan.
          </Quote>

          <SubTitle>Sommaren är perfekt för att säkra ett bra elavtal</SubTitle>
          
          <CheckList>
            <li>Många vill passa på att låsa in låga sommarpriser inför hösten.</li>
            <li>Hos elchef.se väljer du <b>rörligt pris utan påslag eller månadsavgifter</b> – du betalar bara marknadspriset.</li>
            <li>Vi visar även fasta elavtal – perfekt för dig som vill slippa prischocker i vinter.</li>
          </CheckList>

          <InfoBox>
            <h4>Bytet är alltid gratis och enkelt:</h4>
            <ul>
              <li>Helt digitalt.</li>
              <li>Vi fixar uppsägningen hos ditt gamla elbolag.</li>
              <li>Inga papper eller samtal.</li>
              <li>Klart på 14 dagar.</li>
            </ul>
          </InfoBox>

          <div style={{ textAlign: 'center' }}>
            <CTAButton 
              href="https://elchef.se" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              👉 Redo att fixa bästa elavtalet? Byt direkt på elchef.se
            </CTAButton>
          </div>
        </Article>

        <Article>
          <ArticleTitle>Han vill ha billigare el åt folket</ArticleTitle>
          
          <p>
            Många är trötta på krångliga elavtal, dolda avgifter och dyra mellanhänder. I den här artikeln i Hallandsposten berättar elchef.se:s grundare om sin idé: att <b>göra elmarknaden mer rättvis och ge billigare el åt alla</b>.
          </p>

          <VideoBox>
            <a 
              href="https://www.hallandsposten.se/hallands-affarer/han-vill-ha-billigare-el-at-folket.857df3f6-83cd-495c-b0bb-8f44359758e3" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--primary)', 
                textDecoration: 'none', 
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              📰 Läs artikeln i Hallandsposten
            </a>
          </VideoBox>

          <SubTitle>Elchef.se vill göra skillnad:</SubTitle>
          
          <CheckList>
            <li><b>Inga dolda påslag eller avgifter</b> – du ser det riktiga priset.</li>
            <li><b>Full valfrihet</b> – välj mellan rörligt eller fast pris på ett ställe.</li>
            <li><b>Kostnadsfritt att byta</b> – vi sköter allt åt dig.</li>
            <li><b>Transparens och enkelhet</b> – så att alla kan fatta bra beslut.</li>
          </CheckList>

          <SubTitle>Sommaren – bästa tiden att byta elavtal</SubTitle>
          
          <p>
            Just nu är elpriserna ofta lägre tack vare:
          </p>
          
          <WeatherList>
            <li>Fyllda vattenmagasin efter vårfloden.</li>
            <li>Mycket vindkraftproduktion.</li>
            <li>Lägre efterfrågan på uppvärmning.</li>
          </WeatherList>

          <p>
            Smart att teckna rörligt pris till sommarprisnivå.<br />
            Eller välja fast pris och slippa höstrusket i plånboken.
          </p>

          <SubTitle>Därför ska du byta med elchef.se</SubTitle>
          
          <CheckList>
            <li>Helt digitalt – inga papper eller samtal.</li>
            <li>Vi säger upp ditt gamla avtal åt dig.</li>
            <li><b>14 dagar från signering till start – börja planera redan nu.</b></li>
            <li>Alltid marknadens bästa översikt – så du slipper leta själv.</li>
          </CheckList>

          <div style={{ textAlign: 'center' }}>
            <CTAButton 
              href="https://elchef.se" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              👉 Redo att hitta bästa elavtalet? Byt enkelt på elchef.se
            </CTAButton>
          </div>
        </Article>
      </Container>
    </Section>
  );
} 