"use client";

import styled from 'styled-components';
import GoHomeButton from './GoHomeButton';

const Section = styled.section`
  padding: 4rem 0;
  background: transparent;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255,255,255,0.8);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 1rem;
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
  color: #374151;
  margin-bottom: 2rem;
`;
const List = styled.ul`
  margin-bottom: 2rem;
  li {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }
`;
const Quote = styled.blockquote`
  font-style: italic;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
  margin: 2rem 0;
`;
const CTA = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

export default function OmOss() {
  return (
    <Section>
      <Container>
        <Title>Elchef.dk – Om os</Title>
        <Lead>
          <b>Hvem er vi – og hvorfor findes Elchef.dk?</b>
        </Lead>
        <p>
          Elmarkedet i Danmark er ét stort kaos. Over 100 elselskaber, en jungle af elaftaler og prismodeller, og masser af tillæg, faste gebyrer og ekstra tjenester sniger sig ind på fakturaen. Mange har ingen anelse om, hvad de faktisk betaler for – og det ved elselskaberne. Det er netop dér, de tjener deres penge.
        </p>
        <p>
          Vi skabte Elchef.dk, fordi vi var trætte af at se mennesker betale for meget – uden overhovedet at vide det. Vi har set, hvor svært det er at finde en god elaftale blandt alle tilbud, tillæg og det småt trykte.
        </p>
        <p>
          Vi, der står bag Elchef.dk, har selv arbejdet i branchen i over 30 år. Vi har set, hvordan det fungerer bag kulisserne – og hvor svært det er for almindelige mennesker at vide, hvad der er en god aftale, og hvad der bare ser godt ud på overfladen.
        </p>
        <List>
          <li>Vi er <b>ikke</b> et elselskab.</li>
          <li>Du får aldrig en elregning fra os.</li>
          <li>Vi arbejder helt uafhængigt og samarbejder med flere elleverandører for at fremhæve kampagner og rabatter, der faktisk gør en forskel – inklusive unikke tilbud, der kun gælder via Elchef.dk.</li>
          <li>Samtidig søger vi aktivt efter nye elselskaber, der vil tilbyde fair og prisvenlige aftaler uden skjulte gebyrer eller unødvendige tillæg.</li>
        </List>
        <p>
          Vores mål er at give dig kontrollen tilbage. Du skal slippe for at bruge timer på at søge selv. Vi fremhæver kun aftaler, der er værd at overveje – med klare vilkår og priser, du rent faktisk forstår.
        </p>
        <Quote>
          Du behøver ikke at forstå hele elmarkedet – det er vores job.<br />
          Du skal bare træffe én beslutning: at blive Elchef i dit eget hjem.
        </Quote>
        <CTA>
          <GoHomeButton />
        </CTA>
      </Container>
    </Section>
  );
} 