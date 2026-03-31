import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getElectricityArea } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      postalCode,
      formType,
      sessionId
    } = body;

    // Validera att postnummer finns och är giltigt
    if (!postalCode || typeof postalCode !== 'string') {
      return NextResponse.json(
        { error: 'Postnummer krävs' },
        { status: 400 }
      );
    }

    // Rensa postnummer (ta bort mellanslag och specialtecken)
    const cleanPostalCode = postalCode.replace(/\D/g, '').substring(0, 5);
    
    if (cleanPostalCode.length < 3) {
      return NextResponse.json(
        { error: 'Ogiltigt postnummer' },
        { status: 400 }
      );
    }

    // Hämta elområde baserat på postnummer
    const electricityArea = getElectricityArea(cleanPostalCode);

    // Hämta user agent och referer
    const ua = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // Spara sökningen i databasen
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('postal_code_searches').insert({
      postal_code: cleanPostalCode,
      electricity_area: electricityArea,
      form_type: typeof formType === 'string' ? formType : null,
      session_id: typeof sessionId === 'string' ? sessionId : null,
      user_agent: ua,
      referer,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error saving postal code search:', error);
      return NextResponse.json(
        { error: 'Kunde inte spara sökningen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      electricityArea 
    });
  } catch (error) {
    console.error('Error in postal code search endpoint:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
}
