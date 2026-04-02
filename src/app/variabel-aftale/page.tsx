import { fetchActivePublicSuppliers } from '@/lib/publicSuppliers';
import VariabelAftaleClient from './VariabelAftaleClient';

export const revalidate = 120;

export default async function VariabelAftalePage() {
  const suppliers = await fetchActivePublicSuppliers('variabel');
  return <VariabelAftaleClient suppliers={suppliers} />;
}
