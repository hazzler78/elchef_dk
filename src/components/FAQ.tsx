"use client";

import { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const FAQSection = styled.section`
  padding: 4rem 1rem;
  background: transparent;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AccordionItem = styled.div`
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--glass-shadow-light);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow-medium);
  }
`;

const AccordionHeader = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: var(--gray-700);
  text-align: left;
  transition: background-color 0.3s ease;

  svg {
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s;
    color: var(--primary);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 1.25rem 1.25rem' : '0 1.25rem'};
  color: var(--gray-600);
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
    question: "Hur fungerar Elchef?",
    answer: "Elchef hjälper dig hitta det bästa elavtalet för dina specifika behov. Vi jämför priser från flera elbolag och presenterar de bästa alternativen för dig. Processen är helt kostnadsfri och tar bara några minuter."
  },
  {
    question: "Är det verkligen gratis?",
    answer: "Ja, vår tjänst är helt kostnadsfri för dig som kund. Vi får provision från elbolagen när du tecknar avtal, men det påverkar inte ditt pris. Du betalar samma pris som om du hade gått direkt till elbolaget."
  },
  {
    question: "Hur mycket kan jag spara?",
    answer: "Besparingarna varierar beroende på din nuvarande situation, men våra kunder sparar i genomsnitt 15-30% på sin elräkning. Vissa kunder har sparat över 3000 kr per år."
  },
  {
    question: "Vad händer om jag inte är nöjd?",
    answer: "Du kan när som helst byta tillbaka till ditt gamla avtal eller till ett annat bolag. Vi hjälper dig också med processen om du behöver stöd."
  },
  {
    question: "Hur lång tid tar det att byta?",
    answer: "Bytet tar vanligtvis 1-2 månader att genomföra. Din nya leverantör tar över från och med din nästa faktureringsperiod. Under övergångsperioden får du el från din gamla leverantör."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <FAQSection>
      <div className="container">
        <Title>Vanliga frågor</Title>
        {faqData.map((item, index) => (
          <AccordionItem key={index}>
            <AccordionHeader
              $isOpen={openItems.includes(index)}
              onClick={() => toggleItem(index)}
            >
              {item.question}
              <FaChevronDown />
            </AccordionHeader>
            <AccordionContent $isOpen={openItems.includes(index)}>
              <p>{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </div>
    </FAQSection>
  );
} 