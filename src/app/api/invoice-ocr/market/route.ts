import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const ALLOWED_MARKETS = new Set(['DK', 'SE', 'NO', 'UNKNOWN']);

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { logId, logIds, market } = body || {};
    if (typeof market !== 'string' || !ALLOWED_MARKETS.has(market)) {
      return NextResponse.json({ error: 'market saknas eller ogiltigt' }, { status: 400 });
    }

    const ids: number[] = Array.isArray(logIds)
      ? logIds.filter((id): id is number => typeof id === 'number' && id > 0)
      : typeof logId === 'number' && logId > 0
      ? [logId]
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'logId/logIds saknas eller ogiltigt' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase
      .from('invoice_ocr')
      .update({ market })
      .in('id', ids);

    if (error) {
      return NextResponse.json(
        { error: 'Kunde inte uppdatera market', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, updated: ids.length });
  } catch (err) {
    return NextResponse.json({ error: 'Serverfel', details: String(err) }, { status: 500 });
  }
}
