'use client';
import Hero from '@/components/Hero';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import FAQ from '@/components/FAQ';
import NewsletterHero from '@/components/NewsletterHero';
import { usePageView } from '@/lib/usePageView';

export default function Home() {
  // Spåra sidvisning med UTM-parametrar
  usePageView('/');

  return (
    <main>
      <Hero />
      {/* <PriceCalculator /> */}
      <Testimonials />
      <ContactForm />
      <FAQ />
      <NewsletterHero />
    </main>
  );
}
