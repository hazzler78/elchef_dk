import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    console.log('=== FILE-URL API DEBUG ===');
    console.log('req.url:', req.url);
    console.log('req.nextUrl:', req.nextUrl);
    console.log('req.nextUrl.searchParams:', req.nextUrl.searchParams);
    
    // Use req.nextUrl which is designed for edge runtime
    const invoiceIdParam = req.nextUrl.searchParams.get('invoiceId');
    console.log('invoiceIdParam from searchParams:', invoiceIdParam);
    
    if (!invoiceIdParam) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    // Return a direct Supabase storage URL instead of using proxy
    // This avoids edge runtime compatibility issues with Supabase client
    const storageKey = `9/01bdee771f2e0070b4c5b7099e64b337a247f53a43b9150a389b997f6d433988.png`; // Hardcoded for testing
    const supabaseUrl = process.env.SUPABASE_URL;
    const bucketName = 'invoice-ocr';
    
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }
    
    // Create direct storage URL
    const directUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storageKey}`;
    console.log('Returning direct Supabase URL:', directUrl);
    
    return NextResponse.json({ url: directUrl });
  } catch (err) {
    console.error('Unexpected error in file-url API:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: String(err) 
    }, { status: 500 });
  }
}


