"use client";

import styled from 'styled-components';
import React from 'react';
import Link from 'next/link';


const Section = styled.section`
  padding: var(--section-spacing) 0;
  background: transparent;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
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

const PageBackground = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(120deg, rgba(0,201,107,0.10) 0%, rgba(22,147,255,0.10) 100%);
  padding: 0;
`;

// Nya komponenter för kort-design
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
`;

const MediaCard = styled(Link)<{ isExpanded: boolean }>`
  background: rgba(255,255,255,0.95);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-light);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--glass-shadow-heavy);
    border-color: rgba(22, 147, 255, 0.3);
    text-decoration: none;
    color: inherit;
  }
  
  ${props => props.isExpanded && `
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow-heavy);
    border-color: var(--primary);
  `}
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  margin: 0 0 0.5rem 0;
  color: var(--primary);
  line-height: 1.3;
  
  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const CardExcerpt = styled.p`
  color: var(--gray-600);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--gray-500);
`;

const CardTag = styled.span`
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
`;

const ExpandIcon = styled.div`
  margin-left: auto;
  
  svg {
    width: 20px;
    height: 20px;
    color: var(--primary);
  }
`;

// Media artiklar data
const mediaArticles = [
  {
    id: 'weather-electricity-prices',
    title: 'Så påverkar vädret elpriset – förklarat på ett enkelt sätt',
    excerpt: 'Elpriset svänger hela tiden – och vädret är en av de viktigaste faktorerna. På sommaren är priserna ofta lägre, men variationerna styrs ändå av regn, vind och temperatur.',
    tag: 'Video',
    date: '2024',
    type: 'video',
    href: '/media/weather-electricity-prices'
  },
  {
    id: 'robin-hood-electricity',
    title: 'Elens Robin Hood vill ha billigare el åt folket',
    excerpt: 'Många är trötta på krångliga elavtal, dolda avgifter och dyra mellanhänder. I den här artikeln i Hallandsposten berättar Mathias Nilsson om sin plan.',
    tag: 'Artikel',
    date: '2024',
    type: 'article',
    href: '/media/robin-hood-electricity'
  },
  {
    id: 'weekly-news',
    title: 'Veckans nyheter från elmarknaden',
    excerpt: 'Här samlar vi de senaste nyheterna och uppdateringarna från elmarknaden som påverkar dig som konsument.',
    tag: 'Nyheter',
    date: '2024',
    type: 'news',
    href: '/media/weekly-news'
  }
];

export default function Media() {
  return (
    <PageBackground>
      <Section>
        <Container>
          <Title>Media</Title>
          <Lead>
            <b>Vi arbetar aktivt med att sprida kunskap om energibesparing och hållbara elavtal.</b>
          </Lead>
          <p>
            Läs mer om vårt arbete och våra senaste nyheter, eller upptäck våra rapporter och analyser om elmarknaden.
          </p>

          <CardsGrid>
            {mediaArticles.map((article) => (
              <MediaCard 
                key={article.id} 
                href={article.href}
                isExpanded={false}
              >
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardExcerpt>{article.excerpt}</CardExcerpt>
                  <CardMeta>
                    <CardTag>{article.tag}</CardTag>
                    <span>{article.date}</span>
                    <ExpandIcon>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </ExpandIcon>
                  </CardMeta>
                </CardHeader>
              </MediaCard>
            ))}
          </CardsGrid>
        </Container>
      </Section>
    </PageBackground>
  );
} 