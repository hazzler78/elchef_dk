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

    // Sanitize Supabase URL (guard against accidental quotes and trailing slash)
    const cleanSupabaseUrl = SUPABASE_URL.replace(/"/g, '').replace(/\/$/, '');

    // Fetch latest storage_key for this invoice_ocr_id (admin passes invoice_ocr.id)
    const filesUrl = `${cleanSupabaseUrl}/rest/v1/invoice_ocr_files?invoice_ocr_id=eq.${invoiceId}&select=storage_key,created_at&order=created_at.desc&limit=1`;
    const filesRes = await fetch(filesUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!filesRes.ok) {
      const text = await filesRes.text().catch(() => '');
      return NextResponse.json({ error: 'Database error', details: `HTTP ${filesRes.status}: ${text}` }, { status: 500 });
    }

    const fileRows: Array<{ storage_key: string }> = await filesRes.json();
    const fileRow = fileRows && fileRows.length > 0 ? fileRows[0] : null;
    if (!fileRow?.storage_key) {
      return NextResponse.json({ error: 'No image found for this invoice' }, { status: 404 });
    }

    // 3) Return proxy URL (relative)
    const proxyUrl = `/api/invoice-ocr/proxy-image?key=${encodeURIComponent(fileRow.storage_key)}`;
    return NextResponse.json({ url: proxyUrl });
  } catch (err) {
    console.error('Unexpected error in file-url API:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: String(err) 
    }, { status: 500 });
  }
}


