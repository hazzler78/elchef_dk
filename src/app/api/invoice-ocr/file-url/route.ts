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
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Sanitize Supabase URL (guard against accidental quotes and trailing slash)
    const cleanSupabaseUrl = SUPABASE_URL.replace(/"/g, '').replace(/\/$/, '');

    // List objects under the invoice folder in the public bucket using Storage API (works with anon key for public buckets)
    const listUrl = `${cleanSupabaseUrl}/storage/v1/object/list/invoice-ocr`;
    const prefixesToTry = [`${invoiceId}/`, `${invoiceId}`];
    type StorageObject = { name: string };
    let objectName: string | null = null;

    for (const prefix of prefixesToTry) {
      const res = await fetch(listUrl, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          prefix,
          limit: 1,
          sortBy: { column: 'name', order: 'asc' },
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return NextResponse.json({
          error: 'Storage list error',
          details: `HTTP ${res.status}: ${text} (prefix=${prefix})`,
        }, { status: 500 });
      }

      const objs: StorageObject[] = await res.json();
      if (objs && objs.length > 0 && objs[0]?.name) {
        objectName = objs[0].name;
        break;
      }
    }

    if (!objectName) {
      return NextResponse.json({
        error: 'No image found for this invoice',
        details: `No storage object under prefix ${invoiceId}/ or ${invoiceId}`,
      }, { status: 404 });
    }

    const directUrl = `${cleanSupabaseUrl}/storage/v1/object/public/invoice-ocr/${invoiceId}/${objectName}`;
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


