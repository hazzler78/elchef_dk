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
  color: #2563eb;
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
  color: #2563eb;
`;
const Paragraph = styled.p`
  margin-bottom: 1.2rem;
  color: #374151;
`;
const Mail = styled.a`
  color: #2563eb;
  text-decoration: underline;
`;
const ExtLink = styled.a`
  color: #2563eb;
  text-decoration: underline;
`;

export default function Integritetspolicy() {
  return (
    <Section>
      <Container>
        <Title>Personuppgifter och cookies</Title>
        <Updated>Senast uppdaterad: Juli 2025</Updated>

        <SectionTitle>PERSONUPPGIFTER</SectionTitle>
        <Paragraph>
          Denna policy förklarar hur VKNG LTD, organisationsnummer HE477501 (nedan kallat &quot;Företaget&quot;), hanterar dina personuppgifter och vilka rättigheter du har vid användning av vår webbplats elchef.se. Policyn gäller dig som besöker elchef.se eller använder våra tjänster.
        </Paragraph>
        <Paragraph>
          <b>Personuppgifter</b> är information som kan kopplas till en identifierbar person. Att behandla personuppgifter innebär alla typer av hantering, som insamling, strukturering, lagring och radering.
        </Paragraph>
        <Paragraph>
          <b>Personuppgiftsansvarig</b><br />
          Namn: VKNG LTD<br />
          Org.nr: HE477501<br />
          E-post: <Mail href="mailto:info@elchef.se">info@elchef.se</Mail>
        </Paragraph>

        <SectionTitle>1. Insamling vid användning av tjänsten</SectionTitle>
        <Paragraph>
          När du använder elchef.se för att jämföra elavtal kan vi samla in uppgifter som postnummer och elförbrukning, kopplade till din IP-adress. Detta sker med stöd av en intresseavvägning enligt GDPR artikel 6.1(f), då vi behöver dessa uppgifter för att kunna erbjuda vår tjänst.
        </Paragraph>

        <SectionTitle>2. Kontakter och supportärenden</SectionTitle>
        <Paragraph>
          Om du kontaktar oss via e-post eller formulär kan vi behandla information som namn, telefonnummer, e-post och annat du lämnar. Även detta grundas på intresseavvägning enligt GDPR artikel 6.1(f) – vi behöver dessa uppgifter för att kunna svara på din förfrågan.
        </Paragraph>

        <SectionTitle>3. Samarbete med externa parter</SectionTitle>
        <Paragraph>
          För att uppfylla våra avtal med kunder, leverantörer och samarbetspartners behandlar vi nödvändig kontaktinformation. Detta sker med stöd av avtal (GDPR artikel 6.1(b)) eller berättigat intresse (artikel 6.1(f)).
        </Paragraph>

        <SectionTitle>4. Nyhetsbrev och marknadsföring</SectionTitle>
        <Paragraph>
          Genom att registrera din e-post godkänner du att vi får skicka nyhetsbrev och erbjudanden. Vi kan även skicka marknadsföring till befintliga kunder. Behandlingen sker med stöd av samtycke (artikel 6.1(a)) eller berättigat intresse (artikel 6.1(f)). Du kan när som helst återkalla samtycket genom att kontakta oss.
        </Paragraph>

        <SectionTitle>5. Delning av personuppgifter</SectionTitle>
        <Paragraph>
          Vi delar endast dina uppgifter med tredje part om det behövs för att uppfylla syftet, t.ex. när du begär elavtalsofferter från våra samarbetspartners. Våra underleverantörer får inte använda dina uppgifter för egna syften och är bundna av personuppgiftsbiträdesavtal. All behandling sker inom EU/EES.
        </Paragraph>

        <SectionTitle>6. Dina rättigheter</SectionTitle>
        <Paragraph>
          Du har rätt att begära tillgång till, rättelse eller radering av dina personuppgifter. Du kan även begära begränsning, invända mot behandling eller få ut dina uppgifter (dataportabilitet). Mer information finns på <ExtLink href="http://www.imy.se" target="_blank" rel="noopener noreferrer">www.imy.se</ExtLink> (Integritetsskyddsmyndigheten).
        </Paragraph>
        <Paragraph>
          För att utöva dina rättigheter, kontakta oss via e-post. Vi kan komma att begära identitetsverifiering innan vi lämnar ut uppgifter.
        </Paragraph>

        <SectionTitle>7. Lagringstid</SectionTitle>
        <Paragraph>
          Vi sparar dina uppgifter så länge det är nödvändigt för ändamålet de samlades in för, om vi inte enligt lag måste spara dem längre.
        </Paragraph>

        <SectionTitle>8. Klagomål</SectionTitle>
        <Paragraph>
          Om du anser att vi behandlar dina personuppgifter i strid med gällande regler har du rätt att klaga till Integritetsskyddsmyndigheten (IMY). Besök <ExtLink href="http://www.imy.se" target="_blank" rel="noopener noreferrer">www.imy.se</ExtLink> för mer information.
        </Paragraph>
      </Container>
    </Section>
  );
} 