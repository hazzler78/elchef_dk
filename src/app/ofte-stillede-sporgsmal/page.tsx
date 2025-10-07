import FAQ from '@/components/FAQ';

export const metadata = {
  title: 'Ofte stillede spørgsmål - Elchef.dk',
  description: 'Svar på ofte stillede spørgsmål om elaftaler, elpriser og hvordan du skifter elleverandør.',
  openGraph: {
    title: 'Ofte stillede spørgsmål - Elchef.dk',
    description: 'Svar på ofte stillede spørgsmål om elaftaler, elpriser og hvordan du skifter elleverandør.',
  },
};

export default function VanligaFragor() {
  return (
    <main>
      <FAQ />
    </main>
  );
} 