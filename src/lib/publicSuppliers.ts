import { createClient } from '@supabase/supabase-js';

export type PublicSupplier = {
  id: string;
  name: string;
  markup_ore_per_kwh: number;
  monthly_fee_dkk: number;
  notes: string | null;
  signup_url: string | null;
  fastpris_signup_url: string | null;
  offers_variabel: boolean;
  offers_fastpris: boolean;
  sort_order: number;
};

/** Filtrer som vises på /variabel-aftale resp. /fastpris-aftale. Udeladt = alle aktive (fx skift, sammenlign). */
export type PublicSupplierContractFilter = 'variabel' | 'fastpris';

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function asBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (s === 'false' || s === '0') return false;
    if (s === 'true' || s === '1') return true;
  }
  return fallback;
}

export async function fetchActivePublicSuppliers(
  contract?: PublicSupplierContractFilter
): Promise<PublicSupplier[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  let q = supabase
    .from('supplier_markups')
    .select(
      'id,name,markup_ore_per_kwh,monthly_fee_dkk,notes,signup_url,fastpris_signup_url,offers_variabel,offers_fastpris,sort_order'
    )
    .eq('active', true);

  if (contract === 'variabel') {
    q = q.eq('offers_variabel', true);
  } else if (contract === 'fastpris') {
    q = q.eq('offers_fastpris', true);
  }

  const { data, error } = await q
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data?.length) return [];

  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? '').trim() || 'Elleverandør',
    markup_ore_per_kwh: num(row.markup_ore_per_kwh),
    monthly_fee_dkk: num(row.monthly_fee_dkk),
    notes: typeof row.notes === 'string' && row.notes.trim() ? row.notes.trim() : null,
    signup_url:
      typeof row.signup_url === 'string' && row.signup_url.trim()
        ? row.signup_url.trim()
        : null,
    fastpris_signup_url:
      typeof row.fastpris_signup_url === 'string' && row.fastpris_signup_url.trim()
        ? row.fastpris_signup_url.trim()
        : null,
    offers_variabel: asBool(row.offers_variabel, true),
    offers_fastpris: asBool(row.offers_fastpris, true),
    sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
  }));
}
