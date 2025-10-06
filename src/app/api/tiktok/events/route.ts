import { NextRequest, NextResponse } from "next/server";

// Server-side TikTok Events API proxy
// Expects JSON body: { event: string, data: object, event_id?: string, timestamp?: string }

const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || 'D3HQR4RC77U2RE92SKV0';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  if (!TIKTOK_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Missing TIKTOK_ACCESS_TOKEN' }, { status: 500 });
  }

  try {
    const { event, data, event_id, timestamp } = await req.json();

    if (!event) {
      return NextResponse.json({ error: 'Missing event' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || '';
    const url = req.headers.get('referer') || '';

    const payload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: event,
      event_id: event_id || undefined,
      timestamp: timestamp || new Date().toISOString(),
      context: {
        user: {
          ip: ip || undefined,
          user_agent: userAgent || undefined,
        },
        page: {
          url: url || undefined,
        },
      },
      properties: data || {},
    };

    const resp = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': TIKTOK_ACCESS_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json({ error: 'tiktok_error', status: resp.status, body: json }, { status: 502 });
    }

    return NextResponse.json({ ok: true, body: json });
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
}


