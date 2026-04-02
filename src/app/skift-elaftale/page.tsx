import { fetchActivePublicSuppliers } from '@/lib/publicSuppliers';
import SkiftElaftaleClient from './SkiftElaftaleClient';

export const revalidate = 120;

export default async function SkiftElaftalePage() {
  const suppliers = await fetchActivePublicSuppliers();
  return <SkiftElaftaleClient suppliers={suppliers} />;
}
