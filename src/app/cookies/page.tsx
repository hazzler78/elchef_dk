"use client";

import styled from 'styled-components';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow-light);
  padding: 3rem 2rem;
`;
const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;
const Updated = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
`;
const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
`;
const Paragraph = styled.p`
  margin-bottom: 1.2rem;
  color: #374151;
`;
const Mail = styled.a`
  color: var(--primary);
  text-decoration: underline;
`;
const List = styled.ul`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  li {
    margin-bottom: 0.5rem;
  }
`;

export default function Cookies() {
  return (
    <Section>
      <Container>
        <Title>Cookiepolitik for Elchef.dk</Title>
        <Updated>Sidst opdateret: September 2024</Updated>

        <SectionTitle>Hvad er cookies?</SectionTitle>
        <Paragraph>
          Cookies er små tekstfiler, der gemmes på din computer, mobil eller tablet, når du besøger en hjemmeside. De bruges til at få hjemmesiden til at fungere, til at forbedre brugeroplevelsen og til at indsamle statistik.
        </Paragraph>

        <SectionTitle>Hvilke cookies bruger vi?</SectionTitle>
        <Paragraph>
          På Elchef.dk bruger vi:
        </Paragraph>
        <List>
          <li><b>Nødvendige cookies:</b> Kræves for at hjemmesiden fungerer korrekt, f.eks. for at huske dine valg og indstillinger.</li>
          <li><b>Analyse-cookies:</b> Hjælper os med at forstå, hvordan besøgende bruger hjemmesiden, så vi kan forbedre indhold og funktionalitet. Vi bruger f.eks. Google Analytics.</li>
          <li><b>Markedsføringscookies:</b> Kan bruges til at vise relevante tilbud og annoncer, men vi bruger i øjeblikket ingen tredjepartsannoncering.</li>
        </List>

        <SectionTitle>Hvordan kan du håndtere cookies?</SectionTitle>
        <Paragraph>
          Du kan selv vælge at blokere eller slette cookies via indstillingerne i din browser. Vær opmærksom på, at visse funktioner på hjemmesiden kan holde op med at fungere, hvis du blokerer alle cookies.
        </Paragraph>

        <SectionTitle>Samtykke</SectionTitle>
        <Paragraph>
          Når du besøger Elchef.dk for første gang, får du information om, at vi bruger cookies. Ved at fortsætte med at bruge hjemmesiden accepterer du vores brug af cookies i henhold til denne politik.
        </Paragraph>

        <SectionTitle>Kontakt os</SectionTitle>
        <Paragraph>
          Har du spørgsmål om vores cookiepolitik? Kontakt os på <Mail href="mailto:info@elchef.dk">info@elchef.dk</Mail>.
        </Paragraph>
      </Container>
    </Section>
  );
} 