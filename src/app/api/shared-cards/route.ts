import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50', 10), 100);
    const { data, error } = await supabase
      .from('shared_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Strip basic markdown to plain text (bold, italics, links, lists)
function stripMarkdown(md: string): string {
  if (!md) return '';
  let text = md;
  text = text.replace(/\*\*(.+?)\*\*/g, '$1'); // bold
  text = text.replace(/\*(.+?)\*/g, '$1'); // italics
  text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)'); // links
  text = text.replace(/^\s*-\s+/gm, '• '); // lists to bullets
  return text.trim();
}

// POST: normalize a card's summary to plain text
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, id } = body || {};
    if (!url && !id) {
      return NextResponse.json({ error: 'Provide url or id' }, { status: 400 });
    }

    const query = supabase.from('shared_cards').select('*').limit(1);
    const { data, error } = id ? await query.eq('id', id) : await query.eq('url', url);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const card = data[0] as { id: number; summary: string };
    const cleaned = stripMarkdown(card.summary || '');
    const { error: upErr } = await supabase
      .from('shared_cards')
      .update({ summary: cleaned })
      .eq('id', card.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    return NextResponse.json({ success: true, id: card.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


