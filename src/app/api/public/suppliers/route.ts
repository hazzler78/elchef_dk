import { NextResponse } from 'next/server';
import { fetchActivePublicSuppliers } from '@/lib/publicSuppliers';

export const runtime = 'edge';

export async function GET() {
  const suppliers = await fetchActivePublicSuppliers();
  return NextResponse.json(suppliers, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  });
}
