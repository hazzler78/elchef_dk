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

    const invoiceId = parseInt(invoiceIdParam, 10);
    if (Number.isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid invoiceId' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Sanitize Supabase URL (guard against accidental quotes in env)
    const cleanSupabaseUrl = SUPABASE_URL.replace(/"/g, '').replace(/\/$/, '');

    // Query PostgREST directly from edge to avoid supabase-js/node deps
    const restUrl = `${cleanSupabaseUrl}/rest/v1/invoice_ocr_files?invoice_ocr_id=eq.${invoiceId}&select=storage_key&limit=1`;
    const restRes = await fetch(restUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!restRes.ok) {
      const text = await restRes.text().catch(() => '');
      return NextResponse.json({
        error: 'Database error',
        details: `HTTP ${restRes.status}: ${text}`,
      }, { status: 500 });
    }

    const rows: Array<{ storage_key: string }> = await restRes.json();
    const fileRow = rows && rows.length > 0 ? rows[0] : null;

    if (!fileRow || !fileRow.storage_key) {
      return NextResponse.json({
        error: 'No image found for this invoice',
        details: `invoice_ocr_files not found for invoice_ocr_id=${invoiceId}`,
      }, { status: 404 });
    }

    // Create direct public storage URL
    const directUrl = `${cleanSupabaseUrl}/storage/v1/object/public/invoice-ocr/${fileRow.storage_key}`;
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


