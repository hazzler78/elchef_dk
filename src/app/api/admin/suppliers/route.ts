import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { parseOptionalSignupUrl } from '@/lib/supplierSignupUrl';

function parseFiniteNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const t = v.replace(/\s/g, '').replace(',', '.');
    if (t === '' || t === '-' || t === '+') return NaN;
    const n = parseFloat(t);
    if (Number.isFinite(n)) return n;
  }
  return NaN;
}

function assertAdmin(req: NextRequest): NextResponse | null {
  const pw = req.headers.get('x-admin-password')?.trim();
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD?.trim();
  const valid =
    expected !== undefined && expected !== ''
      ? pw === expected
      : pw === 'grodan2025';
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      console.warn('[admin/suppliers POST] 400: mangler navn');
      return NextResponse.json({ error: 'Navn er påkrævet' }, { status: 400 });
    }
    const markup = parseFiniteNumber(body.markup_ore_per_kwh);
    const fee = parseFiniteNumber(body.monthly_fee_dkk ?? 0);
    if (!Number.isFinite(markup)) {
      console.warn('[admin/suppliers POST] 400: ugyldigt påslag', body.markup_ore_per_kwh);
      return NextResponse.json({ error: 'Ugyldigt påslag' }, { status: 400 });
    }
    if (!Number.isFinite(fee) || fee < 0) {
      console.warn('[admin/suppliers POST] 400: ugyldigt månedsgebyr', body.monthly_fee_dkk);
      return NextResponse.json({ error: 'Ugyldigt månedsgebyr' }, { status: 400 });
    }
    const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;
    const parsedUrl = parseOptionalSignupUrl(body.signup_url);
    if (!parsedUrl.ok) {
      console.warn('[admin/suppliers POST] 400: signup_url', parsedUrl.error);
      return NextResponse.json({ error: parsedUrl.error }, { status: 400 });
    }
    const sort_order = Number.isFinite(Number(body.sort_order)) ? Math.round(Number(body.sort_order)) : 0;
    const active = body.active !== false;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('supplier_markups')
      .insert({
        name,
        markup_ore_per_kwh: markup,
        monthly_fee_dkk: fee,
        notes,
        signup_url: parsedUrl.url,
        sort_order,
        active,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('supplier_markups insert:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Server fejl';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'id er påkrævet' }, { status: 400 });
    }
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (body.markup_ore_per_kwh !== undefined) {
      const v = parseFiniteNumber(body.markup_ore_per_kwh);
      if (!Number.isFinite(v)) {
        return NextResponse.json({ error: 'Ugyldigt påslag' }, { status: 400 });
      }
      updates.markup_ore_per_kwh = v;
    }
    if (body.monthly_fee_dkk !== undefined) {
      const v = parseFiniteNumber(body.monthly_fee_dkk);
      if (!Number.isFinite(v) || v < 0) {
        return NextResponse.json({ error: 'Ugyldigt månedsgebyr' }, { status: 400 });
      }
      updates.monthly_fee_dkk = v;
    }
    if (body.notes !== undefined) {
      updates.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;
    }
    if (body.signup_url !== undefined) {
      const parsedUrl = parseOptionalSignupUrl(body.signup_url);
      if (!parsedUrl.ok) {
        return NextResponse.json({ error: parsedUrl.error }, { status: 400 });
      }
      updates.signup_url = parsedUrl.url;
    }
    if (body.sort_order !== undefined && Number.isFinite(Number(body.sort_order))) {
      updates.sort_order = Math.round(Number(body.sort_order));
    }
    if (body.active !== undefined) {
      updates.active = Boolean(body.active);
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('supplier_markups').update(updates).eq('id', id).select().single();
    if (error) {
      console.error('supplier_markups update:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Server fejl';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id er påkrævet' }, { status: 400 });
    }
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('supplier_markups').delete().eq('id', id);
    if (error) {
      console.error('supplier_markups delete:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Server fejl';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'edge';
