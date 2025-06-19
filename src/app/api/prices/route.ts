import { NextResponse } from 'next/server';
import { CheapEnergyPrices } from '@/lib/types';

export async function GET() {
  try {
    const response = await fetch('https://www.cheapenergy.se/Site_Priser_CheapEnergy_de.json', {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prices from Cheap Energy');
    }

    const data: CheapEnergyPrices = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
} 