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

export default function Integritetspolicy() {
  return (
    <Section>
      <Container>
        {/* TikTok Site Verification */}
        <div style={{ fontSize: '1px', color: 'transparent', position: 'absolute', left: '-9999px' }}>
          tiktok-developers-site-verification=i7h859t0QF0G6Dua8q4h9qJUXwuPQoof
        </div>
        <Title>Privatlivspolitik for elchef.dk</Title>
        <Updated>Sidst opdateret: August 2025</Updated>

        <SectionTitle>1. Vores ansvar for dine personoplysninger</SectionTitle>
        <Paragraph>
          VKNG LTD (benævnt som &quot;Elchef.dk&quot;, &quot;vi&quot; eller &quot;os&quot;) er dataansvarlig for behandlingen af dine personoplysninger, når du bruger vores hjemmeside elchef.dk. Denne privatlivspolitik forklarer, hvordan vi indsamler, bruger og beskytter dine personlige oplysninger.
        </Paragraph>

        <SectionTitle>2. Hvilke personoplysninger vi indsamler</SectionTitle>
        <Paragraph>
          Vi indsamler oplysninger, som du giver os direkte, såsom navn, e-mailadresse, telefonnummer og adresse, når du bruger vores tjenester. Vi indsamler også teknisk information om, hvordan du bruger hjemmesiden, herunder IP-adresse, browsertype og besøgsdata.
        </Paragraph>

        <SectionTitle>3. Hvordan vi bruger dine personoplysninger</SectionTitle>
        <Paragraph>
          Vi bruger dine personoplysninger til at levere vores tjenester, forbedre brugeroplevelsen, kommunikere med dig og overholde lovkrav. Vi deler ikke dine personoplysninger med tredjepart uden dit samtykke, undtagen når det kræves for at levere vores tjenester.
        </Paragraph>

        <SectionTitle>4. Behandling af fakturabilleder (OCR)</SectionTitle>
        <Paragraph>
          Når du uploader et billede af din elregning til analyse, behandles billedet, så vi kan give dig en analyse her og nu. Denne øjeblikkelige behandling sker med hjemmel i aftale/legitim interesse, og billedet behøver ikke gemmes permanent for at tjenesten fungerer.
        </Paragraph>
        <Paragraph>
          <strong>Samtykke til lagring:</strong> Hvis du vil hjælpe os med at forbedre tjenesten, kan du give et <em>frivilligt, udtrykkelig samtykke</em> til, at vi gemmer dit fakturabillede i en begrænset periode til kvalitetssikring og udvikling. Samtykke gives via en umarkeret afkrydsningsboks i forbindelse med upload og kan tilbagekaldes når som helst.
        </Paragraph>
        <Paragraph>
          <strong>Hvad der kan gemmes ved samtykke:</strong>
        </Paragraph>
        <ul>
          <li>Originalbilledet af fakturaen</li>
          <li>Teknisk metadata om billedet (f.eks. filtype og størrelse)</li>
          <li>Billedets kryptografiske checksum (SHA‑256) til identifikation/deduplikering</li>
          <li>Kobling til sessions-ID og tidspunkt for upload</li>
        </ul>
        <Paragraph>
          <strong>Lagring, modtagere og overførsler:</strong> Billeder gemmes i en privat, adgangsbeskyttet lagringsløsning hos vores driftsleverandør (Supabase). Til OCR/analyse bruger vi en AI-leverandør (OpenAI) som databehandler. Behandlingen kan indebære overførsel af data uden for EU/EØS; i så fald anvendes standardkontraktbestemmelser (SCC) og andre relevante beskyttelsesforanstaltninger i henhold til GDPR.
        </Paragraph>
        <Paragraph>
          <strong>Lagringsperiode:</strong> Ved samtykke gemmes fakturabilledet i op til 90 dage, hvorefter det slettes automatisk. Du kan til enhver tid tilbagekalde dit samtykke, hvorefter vi sletter billedet hurtigst muligt.
        </Paragraph>
        <Paragraph>
          <strong>Uden samtykke:</strong> Vi gemmer ikke selve billedet. Vi kan dog gemme AI'ens tekstanalyse og begrænset teknisk metadata (f.eks. hashværdi) til fejlsøgning, statistik og for at forhindre dobbelt upload.
        </Paragraph>

        <SectionTitle>5. Dine rettigheder</SectionTitle>
        <Paragraph>
          Du har ret til at få oplysninger om, hvilke personoplysninger vi har om dig, anmode om rettelse af fejlagtige oplysninger, anmode om sletning af dine oplysninger og gøre indsigelse mod vores behandling. Du kan også anmode om at få dine oplysninger overført til en anden leverandør.
        </Paragraph>

        <SectionTitle>6. Cookies og sporing</SectionTitle>
        <Paragraph>
          Vi bruger cookies og lignende teknologier til at forbedre hjemmesidens funktionalitet og analysere brugsmønstre. Du kan administrere dine cookie-indstillinger i din browser.
        </Paragraph>

        <SectionTitle>7. Sikkerhed</SectionTitle>
        <Paragraph>
          Vi implementerer passende tekniske og organisatoriske sikkerhedsforanstaltninger for at beskytte dine personoplysninger mod uautoriseret adgang, tab eller ødelæggelse.
        </Paragraph>

        <SectionTitle>8. Kontakt</SectionTitle>
        <Paragraph>
          Ved spørgsmål om denne privatlivspolitik eller vores behandling af personoplysninger, kontakt os via e-mail: <Mail href="mailto:info@elchef.dk">info@elchef.dk</Mail>
        </Paragraph>

        <SectionTitle>9. Ændringer af denne politik</SectionTitle>
        <Paragraph>
          Vi kan opdatere denne privatlivspolitik ved behov. Alle ændringer meddeles på hjemmesiden og træder i kraft, når de publiceres.
        </Paragraph>
      </Container>
    </Section>
  );
} 