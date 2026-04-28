import { fetchActivePublicSuppliers } from '@/lib/publicSuppliers';
import FastprisAftaleClient from './FastprisAftaleClient';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function FastprisAftalePage() {
  const suppliers = await fetchActivePublicSuppliers('fastpris');
  return <FastprisAftaleClient suppliers={suppliers} />;
}
