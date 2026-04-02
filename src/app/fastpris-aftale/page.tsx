import { fetchActivePublicSuppliers } from '@/lib/publicSuppliers';
import FastprisAftaleClient from './FastprisAftaleClient';

export const revalidate = 120;

export default async function FastprisAftalePage() {
  const suppliers = await fetchActivePublicSuppliers('fastpris');
  return <FastprisAftaleClient suppliers={suppliers} />;
}
