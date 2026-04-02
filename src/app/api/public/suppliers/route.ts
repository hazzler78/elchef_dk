import { NextRequest, NextResponse } from 'next/server';
import {
  fetchActivePublicSuppliers,
  type PublicSupplierContractFilter,
} from '@/lib/publicSuppliers';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const a = req.nextUrl.searchParams.get('aftale');
  const contract: PublicSupplierContractFilter | undefined =
    a === 'fastpris' || a === 'variabel' ? a : undefined;
  const suppliers = await fetchActivePublicSuppliers(contract);
  return NextResponse.json(suppliers, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  });
}
