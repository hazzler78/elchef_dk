"use client";

import styled from 'styled-components';
import TrustpilotCarousel from './TrustpilotCarousel';

const TestimonialsSection = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export default function Testimonials() {
  return (
    <TestimonialsSection>
      <div className="container">
        <SectionTitle>Hvad vores elchefer siger</SectionTitle>
        <TrustpilotCarousel />
      </div>
    </TestimonialsSection>
  );
} 