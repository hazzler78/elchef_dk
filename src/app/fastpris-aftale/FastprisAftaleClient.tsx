'use client';

import Link from 'next/link';
import type { PublicSupplier } from '@/lib/publicSuppliers';
import AftaleFlowLayout from '@/components/aftale/AftaleFlowLayout';

export default function FastprisAftaleClient({ suppliers }: { suppliers: PublicSupplier[] }) {
  return (
    <AftaleFlowLayout
      suppliers={suppliers}
      contractType="fastpris"
      ctaMedium="fastpris-aftale"
      viewContentId="fastpris-aftale"
      viewContentName="Fastprisaftale"
      title="Skift til fastprisaftale"
      subtitle="Fast kWh-pris giver tryghed mod udsving — vælg en partner nedenfor og fortsæt til skiftet med ét klik."
      cardLeadWithSuppliers="Klik på den fastprisaftale, du vil have — vi sender dig videre til leverandøren."
      cardLeadWithoutSuppliers="Vi opdaterer vores fastpris-partnere. Brug linkene nedenfor, så hjælper vi dig videre."
      fallback={
        <>
          <Link href="/sammenlign-elpriser" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sammenlign din elregning med AI
          </Link>{' '}
          eller <Link href="/kontakt" style={{ color: 'var(--primary)', fontWeight: 600 }}>kontakt os</Link> for et
          personligt fastpris-tilbud.
        </>
      }
      footer={
        <>
          Vil du sammenligne din nuværende regning først?{' '}
          <Link href="/sammenlign-elpriser">Prøv gratis AI-analyse</Link>
          {' · '}
          <Link href="/variabel-aftale">Se variabel aftale i stedet</Link>
        </>
      }
    />
  );
}
