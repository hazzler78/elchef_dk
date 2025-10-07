"use client";

import { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const FAQSection = styled.section`
  padding: 4rem 1rem;
  background: transparent;
  border-radius: var(--radius-lg);
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
  font-size: 2rem;
`;

const AccordionItem = styled.div`
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: var(--glass-shadow-light);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
`;

const AccordionHeader = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$isOpen ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)'};
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: white;
  text-align: left;

  svg {
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s;
    color: var(--primary);
  }

  &:hover {
    background: rgba(255,255,255,0.12);
  }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 1.25rem 1.25rem' : '0 1.25rem'};
  color: rgba(255,255,255,0.9);
  max-height: ${props => props.$isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  opacity: ${props => props.$isOpen ? '1' : '0'};

  p {
    margin-bottom: 1rem;
  }

  ul {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const faqData = [
  {
    question: "Hvordan finder jeg gode elaftaler?",
    answer: "Hvis du ikke finder en aftale, du ønsker på vores side, kan du registrere din e-mailadresse i formularen nederst på siden. Dette giver dig mulighed for at sikre gode priser, før tilbud med begrænset kapacitet bliver fuldt booket."
  },
  {
    question: "Hvordan fungerer Elchef.dk?",
    answer: "Elchef.dk finder gode elaftaler fra forskellige leverandører og giver dig mulighed for at vælge den aftale, der passer dig bedst. Du kan være sikker på, at de tilbud, du finder her, er konkurrencedygtige på markedet!"
  },
  {
    question: "Hvad skal jeg vælge? Fastpris eller variabel pris?",
    answer: "Det afhænger af din livsstil og hvad du føler dig tryg ved. Med en fastprisaftale har du forudsigelighed gennem hele aftaleperioden. Med en variabel pris følger din elpris markedets svingninger, men kan potentielt spare penge på lang sigt. Spørg dig selv: Tror du, at elpriserne bliver billigere eller dyrere fremover?"
  },
  {
    question: "Hvad er en Elchef?",
    answer: "En \"Elchef\" tager kontrol over sin elaftale for at holde omkostningerne nede. Du er en elchef, når du gør et bevidst valg for at sikre en bedre aftale og undgå at betale mere end nødvendigt."
  },
  {
    question: "Skal jeg opsige min gamle elaftale, hvis jeg skifter leverandør?",
    answer: "Nej, du behøver normalt ikke at opsige din gamle elaftale selv. Når du skifter elleverandør, håndterer den nye leverandør normalt skiftet for dig, inklusive opsigelsen af din tidligere aftale. Det er dog en god idé at kontrollere vilkårene i din nuværende aftale, især hvis du har en fastprisaftale, da der kan være opsigelsesfrist eller gebyrer for at afslutte aftalen før tid."
  },
  {
    question: "Er der noget gebyr for at opsige en elaftale?",
    answer: `Variable elaftaler kan normalt opsiges uden gebyr og har typisk en opsigelsesfrist på en måned.

Fastprisaftaler har derimod en bindingsperiode, og hvis du ønsker at afslutte aftalen før tid, kan der komme et ophørsgebyr (også kaldet afståelsesgebyr). Gebyret varierer mellem forskellige leverandører og afhænger af, hvor lang tid der er tilbage af aftalen samt elprisudviklingen.

Det er altid bedst at kontrollere vilkårene i din aftale eller kontakte din elleverandør for at få præcis information om, hvad der gælder ved en opsigelse.`
  },
  {
    question: "Hvilken elpriszone tilhører jeg?",
    answer: `Danmark er inddelt i to elpriszoner:

DK1 - Vestdanmark (Jylland og Fyn)
DK2 - Østdanmark (Sjælland, Lolland-Falster, Bornholm)

Hvilken elpriszone du tilhører afhænger af, hvor du bor, og påvirker elprisen i din region. Du kan se din elpriszone på din elregning, ved at kontakte din netleverandør, eller bruge formularen i vores aftalelister.`
  },
  {
    question: "Hvad skal jeg overveje, når jeg vælger elaftale?",
    answer: "Vælg elaftale ud fra din økonomiske situation og din risikotolerance. Hvis du har et stramt budget og vil undgå prisudsving, kan en fastprisaftale være et godt alternativ. Variable aftaler (spotpris) har historisk set været billigere over tid, men indebærer større risiko for prisvariationer. Tænk over, hvad der passer bedst til din situation, før du træffer dit valg."
  },
  {
    question: "Kan jeg fortryde min elaftale?",
    answer: `Ja, ifølge forbrugeraftalelov har du fortrydelsesret i 14 dage, når du indgår en aftale på distancen, for eksempel digitalt eller via telefon. Det betyder, at du kan fortryde aftalen uden omkostninger inden for denne periode. Der er dog undtagelser:

• Hvis du har betalt for forbrugt el under fortrydelsesperioden, kan leverandøren kræve erstatning for den el, du har brugt.
• Fortrydelsesretten gælder ikke, hvis du har indgået aftalen gennem et personligt møde hos leverandøren eller i en butik.
• Nogle leverandører kan have egne vilkår vedrørende opsigelse efter fortrydelsesfristen, så det er altid godt at læse aftalen grundigt.
• Hvis du vil fortryde din aftale, skal du meddele leverandøren skriftligt, via e-mail eller fortrydelsesformular.`
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <FAQSection>
      <Container>
        <Title>Ofte stillede spørgsmål</Title>
        {faqData.map((faq, index) => (
          <AccordionItem key={index}>
            <AccordionHeader
              onClick={() => toggleAccordion(index)}
              $isOpen={openIndex === index}
            >
              {faq.question}
              <FaChevronDown />
            </AccordionHeader>
            <AccordionContent $isOpen={openIndex === index}>
              <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Container>
    </FAQSection>
  );
} 