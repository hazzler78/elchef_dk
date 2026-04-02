import { createClient } from '@supabase/supabase-js';

export type PublicSupplier = {
  id: string;
  name: string;
  markup_ore_per_kwh: number;
  monthly_fee_dkk: number;
  notes: string | null;
  signup_url: string | null;
  sort_order: number;
};

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function fetchActivePublicSuppliers(): Promise<PublicSupplier[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('supplier_markups')
    .select('id,name,markup_ore_per_kwh,monthly_fee_dkk,notes,signup_url,sort_order')
    .eq('active', true)
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
    sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
  }));
}
