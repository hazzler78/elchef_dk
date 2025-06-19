import Hero from '@/components/Hero';
import PriceCalculator from '@/components/PriceCalculator';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <PriceCalculator />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
