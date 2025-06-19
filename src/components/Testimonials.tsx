"use client";

import styled from 'styled-components';
import { FaStar } from 'react-icons/fa';
import Image from 'next/image';

const TestimonialsSection = styled.section`
  padding: var(--section-spacing) 0;
  background: var(--gray-50);
`;

const TrustpilotScore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  text-align: center;

  h2 {
    margin-bottom: 1rem;
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;

  svg {
    color: #00b67a; // Trustpilot green
    font-size: 2rem;
  }
`;

const Score = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-700);
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TestimonialCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);

  p {
    color: var(--gray-600);
    font-style: italic;
    margin-bottom: 1rem;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    border-radius: 50%;
  }

  div {
    h4 {
      margin: 0;
      color: var(--gray-700);
    }
    
    span {
      color: var(--gray-600);
      font-size: 0.875rem;
    }
  }
`;

const testimonials = [
  {
    text: "Otroligt smidigt! Jag sparar nu över 3000 kr per år på mitt elavtal tack vare Elchef. Processen var enkel och support fanns alltid tillgänglig.",
    name: "Anna Svensson",
    location: "Stockholm",
    image: "/testimonial1.jpg"
  },
  {
    text: "Jag blev min egen elchef och min första månad, maj 2025, så fick jag en faktura på 290kr. Innan betalade jag närmare 1000kr för samma mäng el av Vattenfall. Rekommenderar starkt.",
    name: "Alex",
    location: "Göteborg",
    image: "/testimonial2.jpg"
  },
  {
    text: "Är så tacksam för Mathias Nilsson och elchef! Min elräkning har minskat drastiskt sedan jag bytte till ett schysstare elavtal på elchef.se. Jag hjälpte även min mamma och lillebror att byta på elchef.se. Kan verkligen rekommendera er andra att göra det med om ni vill spara pengar!",
    name: "Sandra Larsson",
    location: "Malmö",
    image: "/testimonial3.jpg"
  }
];

export default function Testimonials() {
  return (
    <TestimonialsSection>
      <div className="container">
        <TrustpilotScore>
          <h2>Våra kunder älskar oss</h2>
          <Stars>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </Stars>
          <Score>
            4.8 av 5 på Trustpilot
            <br />
            Baserat på över 1000 recensioner
          </Score>
        </TrustpilotScore>

        <TestimonialGrid>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index}>
              <p>&quot;{testimonial.text}&quot;</p>
              <CustomerInfo>
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  style={{ borderRadius: '50%' }}
                />
                <div>
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.location}</span>
                </div>
              </CustomerInfo>
            </TestimonialCard>
          ))}
        </TestimonialGrid>
      </div>
    </TestimonialsSection>
  );
} 