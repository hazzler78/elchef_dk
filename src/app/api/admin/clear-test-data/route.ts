import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    // Ta bort alla rader där source = 'test-admin'
    const { error, count } = await supabase
      .from('contract_clicks')
      .delete()
      .eq('source', 'test-admin');

    if (error) {
      console.error('Error clearing test data:', error);
      return NextResponse.json({ 
        error: 'Failed to clear test data',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: count,
      message: `Removed ${count} test records` 
    });
  } catch (error) {
    console.error('Clear test data error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: String(error) 
    }, { status: 500 });
  }
}
