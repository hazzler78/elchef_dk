'use client';

import Link from 'next/link';
import type { PublicSupplier } from '@/lib/publicSuppliers';
import AftaleFlowLayout from '@/components/aftale/AftaleFlowLayout';

export default function VariabelAftaleClient({ suppliers }: { suppliers: PublicSupplier[] }) {
  return (
    <AftaleFlowLayout
      suppliers={suppliers}
      contractType="variabel"
      ctaMedium="variabel-aftale"
      viewContentId="variabel-aftale"
      viewContentName="Variabel aftale"
      title="Skift til variabel elaftale"
      subtitle="Vælg en elleverandør nedenfor — ét klik, og du fortsætter til skiftet. Gratis og uden binding hos de fleste partnere."
      cardLeadWithSuppliers="Klik på den aftale, du vil have — vi sender dig videre til leverandøren."
      cardLeadWithoutSuppliers="Vi opdaterer vores partnere. Brug linket nedenfor, så hjælper vi dig videre."
      fallback={
        <>
          Kontakt os eller{' '}
          <Link href="/sammenlign-elpriser" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            sammenlign din elregning med AI
          </Link>{' '}
          — så finder vi den rigtige variabel aftale til dig.
        </>
      }
      footer={
        <>
          Vil du sammenligne din nuværende regning først?{' '}
          <Link href="/sammenlign-elpriser">Prøv gratis AI-analyse</Link>
          {' · '}
          <Link href="/fastpris-aftale">Se fastpris i stedet</Link>
        </>
      }
    />
  );
}
