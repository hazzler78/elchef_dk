import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    // Use req.nextUrl which is designed for edge runtime
    const storageKey = req.nextUrl.searchParams.get('key');
    
    console.log('Proxy endpoint - storage key:', storageKey);
    console.log('Request URL:', req.url);
    
    if (!storageKey) {
      console.error('Missing storage key in proxy request');
      return NextResponse.json({ error: 'Missing storage key' }, { status: 400 });
    }

    // Create signed URL via Storage REST (edge-safe)
    const cleanSupabaseUrl = SUPABASE_URL.replace(/"/g, '').replace(/\/$/, '');
    // Use raw storageKey; Supabase handles encoding
    const signUrl = `${cleanSupabaseUrl}/storage/v1/object/sign/invoice-ocr/${storageKey}?download=false`;
    const signRes = await fetch(signUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ expiresIn: 600 }), // 10 minutes
    });

    if (!signRes.ok) {
      const text = await signRes.text().catch(() => '');
      return NextResponse.json({ error: 'Could not create signed URL', details: `HTTP ${signRes.status}: ${text}` }, { status: 500 });
    }

    const { signedURL } = await signRes.json();
    const fetchUrl = signedURL.startsWith('http')
      ? signedURL
      : `${cleanSupabaseUrl}${signedURL.startsWith('/') ? signedURL : `/${signedURL}`}`;

    // Fetch the image from the signed URL
    const imageResponse = await fetch(fetchUrl);

    if (!imageResponse.ok) {
      console.error('Failed to fetch image from signed URL:', fetchUrl, 'Status:', imageResponse.status);
      return NextResponse.json({ 
        error: 'Could not fetch image',
        details: `HTTP ${imageResponse.status}: ${imageResponse.statusText}`
      }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=600', // 10 minutes cache
        'Content-Disposition': 'inline',
      },
    });

  } catch (err) {
    console.error('Proxy image error:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: String(err) 
    }, { status: 500 });
  }
}
