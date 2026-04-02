-- =============================================================================
-- Elchef: supplier_markups — kör HELA filen i Supabase SQL Editor (ett körning).
-- Projekt: samma som NEXT_PUBLIC_SUPABASE_URL i .env
-- =============================================================================

-- uuid (Supabase / PG 13+ har ofta detta inbyggt; säkerställ om CREATE TABLE skulle klaga)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.supplier_markups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  markup_ore_per_kwh NUMERIC(14, 4) NOT NULL DEFAULT 0,
  monthly_fee_dkk NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  signup_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_markups_active ON public.supplier_markups(active);
CREATE INDEX IF NOT EXISTS idx_supplier_markups_sort ON public.supplier_markups(sort_order);

-- Eksisterende projekter (CREATE TABLE IF NOT EXISTS tilføjer ikke nye kolonner):
ALTER TABLE public.supplier_markups ADD COLUMN IF NOT EXISTS signup_url TEXT;

ALTER TABLE public.supplier_markups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supplier_markups_select_public" ON public.supplier_markups;
CREATE POLICY "supplier_markups_select_public" ON public.supplier_markups
  FOR SELECT
  USING (true);

-- Anon får bara läsa. API som använder service_role-nyckeln måste få INSERT/UPDATE/DELETE:
GRANT SELECT ON public.supplier_markups TO anon, authenticated;
GRANT ALL ON public.supplier_markups TO service_role;

-- Explicit RLS för service_role (löser "violates row-level security" om PostgREST utvärderar RLS mot fel roll)
DROP POLICY IF EXISTS "supplier_markups_service_role_all" ON public.supplier_markups;
CREATE POLICY "supplier_markups_service_role_all" ON public.supplier_markups
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.supplier_markups IS 'El-leverandørers påslag (øre/kWh) og gebyrer til intern visning og beregning';
COMMENT ON COLUMN public.supplier_markups.markup_ore_per_kwh IS 'Påslag i øre per kWh (spot/afregning); negativ værdi = rabat under spot';
COMMENT ON COLUMN public.supplier_markups.monthly_fee_dkk IS 'Fast månedsgebyr i DKK';
COMMENT ON COLUMN public.supplier_markups.signup_url IS 'Eksternt tilmeldingslink (postnr., forbrug, CPR, signering) — én unik URL pr. leverandør';

-- Uppdatera PostgREST cache (undvik "schema cache" efter skapning)
NOTIFY pgrst, 'reload schema';

-- Verifiering (ska returnera 0 rader, INTE fel):
-- SELECT * FROM public.supplier_markups LIMIT 1;
--
-- RLS-fel vid INSERT via API = nästan alltid fel API-nyckel (anon i stället för service_role).
-- Kontrollera policies + roller:
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'supplier_markups';
