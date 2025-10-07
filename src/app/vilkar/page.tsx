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

export default function Villkor() {
  return (
    <Section>
      <Container>
        <Title>Brugervilkår for elchef.dk</Title>
        <Updated>Sidst opdateret: Juli 2025</Updated>

        <SectionTitle>1. Elchef.dk og vores tjenester</SectionTitle>
        <Paragraph>
          VKNG LTD (benævnt som &quot;Elchef.dk&quot;, &quot;vi&quot; eller &quot;os&quot;) leverer en platform til at formidle elaftaler via elchef.dk. Formålet med tjenesten er at gøre det nemmere for forbrugere at finde en fordelagtig elaftale ved at præsentere et udvalg af forhandlede tilbud.
        </Paragraph>

        <SectionTitle>2. Brugervilkår</SectionTitle>
        <Paragraph>
          Disse vilkår gælder for al brug af vores hjemmeside og vores tjenester. Læs dem omhyggeligt. Ved at bruge vores hjemmeside bekræfter du, at du har læst, forstået og accepteret vilkårene. Hvis du ikke accepterer dem, skal du ikke bruge vores hjemmeside.
        </Paragraph>

        <SectionTitle>3. Brug af hjemmesiden</SectionTitle>
        <Paragraph>
          Du forpligter dig til at bruge hjemmesiden i overensstemmelse med gældende love og regler. Misbrug, herunder forsøg på at omgå sikkerhedssystemer eller få uautoriseret adgang, kan føre til udelukkelse.
        </Paragraph>

        <SectionTitle>4. Ændringer af vilkårene</SectionTitle>
        <Paragraph>
          Elchef.dk forbeholder sig retten til at opdatere brugervilkårene ved behov – for eksempel på grund af lovændringer, tekniske justeringer eller forbedringer af tjenesten. Alle ændringer meddeles på hjemmesiden mindst 14 dage i forvejen, undtagen ved hastende sikkerheds- eller lovkrav, hvor ændringer kan gælde med det samme.
        </Paragraph>

        <SectionTitle>5. Tilbud fra elselskaber</SectionTitle>
        <Paragraph>
          Elchef.dk kan vise tilbud fra alle elselskaber, der er listet i Forbrugerportalen. Målet er at give dig et bredt overblik, så du kan vælge den aftale, der passer dig bedst.
        </Paragraph>

        <SectionTitle>6. Kontakt</SectionTitle>
        <Paragraph>
          Ved spørgsmål om brugervilkårene, kontakt os via e-mail: <Mail href="mailto:info@elchef.dk">info@elchef.dk</Mail>
        </Paragraph>

        <SectionTitle>7. Fortrydelsesret</SectionTitle>
        <Paragraph>
          Du har ret til at fortryde en elaftale indgået via nettet. For detaljer om, hvordan du udøver fortrydelsesretten, henvises til elselskabets aftalevilkår.
        </Paragraph>

        <SectionTitle>8. Fejl i tjenesten</SectionTitle>
        <Paragraph>
          Elchef.dk er ikke ansvarlig for skader eller tab som følge af brug af tjenesten eller mangel på tilgængelig information. Vi kan ikke garantere, at hjemmesiden altid er tilgængelig eller fejlfri. Elselskabet er ansvarlig for at levere i henhold til den aftale, du indgår. Elchef.dk repræsenterer ikke elselskaberne. Ved fejl skal du kontakte elselskabet direkte, så snart fejlen opdages.
        </Paragraph>

        <SectionTitle>9. Priser og betaling</SectionTitle>
        <Paragraph>
          Det er gratis at bruge Elchef.dk. Der tilkommer ingen ekstra omkostninger på din elregning. Elpriserne fastsættes af det respektive elselskab. Vi bestræber os på at holde priserne og vilkårene opdateret, men tager forbehold for ændringer foretaget af tredjeparter. Betaling sker direkte til det elselskab, du har valgt, i henhold til deres aftale.
        </Paragraph>

        <SectionTitle>10. Tvister og gældende lov</SectionTitle>
        <Paragraph>
          Tvister skal primært løses gennem dialog. Hvis det ikke lykkes, kan du henvende dig til Forbrugerombudsmanden eller Forbrugerklagenævnet. Disse vilkår er underlagt dansk lov. Tvister behandles af dansk domstol.
        </Paragraph>
      </Container>
    </Section>
  );
} 