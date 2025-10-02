import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Removed edge runtime to avoid URL parsing issues

export async function GET(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const storageKey = searchParams.get('key');
    
    console.log('Proxy endpoint - storage key:', storageKey);
    console.log('Request URL:', req.url);
    
    if (!storageKey) {
      console.error('Missing storage key in proxy request');
      return NextResponse.json({ error: 'Missing storage key' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Create signed URL for the image
    const { data: signed, error: signErr } = await supabase
      .storage
      .from('invoice-ocr')
      .createSignedUrl(storageKey, 60 * 10); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      console.error('Storage error when creating signed URL:', signErr);
      return NextResponse.json({ 
        error: 'Could not create signed URL', 
        details: signErr?.message || 'Unknown storage error'
      }, { status: 500 });
    }

    // Fetch the image from the signed URL
    const imageResponse = await fetch(signed.signedUrl);
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image from signed URL:', signed.signedUrl, 'Status:', imageResponse.status);
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
