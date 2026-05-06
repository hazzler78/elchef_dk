-- Backfill av market för befintliga invoice_ocr-rader
-- Mål: separera DK/SE/NO och lämna osäkra rader som UNKNOWN.
-- Kör i Supabase SQL Editor.

BEGIN;

-- 1) Sätt UNKNOWN för alla rader som saknar market idag
UPDATE public.invoice_ocr
SET market = 'UNKNOWN'
WHERE market IS NULL OR btrim(market) = '';

-- 2) Klassificera DK (danska nyckelord)
UPDATE public.invoice_ocr
SET market = 'DK'
WHERE market = 'UNKNOWN'
  AND (
    coalesce(gpt_answer, '') ILIKE '%du betaler%'
    OR coalesce(gpt_answer, '') ILIKE '%unødige omkostninger%'
    OR coalesce(gpt_answer, '') ILIKE '%elregning%'
    OR coalesce(gpt_answer, '') ILIKE '%vil du også opdage%'
    OR coalesce(gpt_answer, '') ILIKE '%løsningen%'
  );

-- 3) Klassificera SE (svenska nyckelord)
UPDATE public.invoice_ocr
SET market = 'SE'
WHERE market = 'UNKNOWN'
  AND (
    coalesce(gpt_answer, '') ILIKE '%dina onödiga elavgifter%'
    OR coalesce(gpt_answer, '') ILIKE '%elräkning%'
    OR coalesce(gpt_answer, '') ILIKE '%onödiga avgifter%'
    OR coalesce(gpt_answer, '') ILIKE '%din årliga besparing%'
  );

-- 4) Klassificera NO (norska nyckelord)
UPDATE public.invoice_ocr
SET market = 'NO'
WHERE market = 'UNKNOWN'
  AND (
    coalesce(gpt_answer, '') ILIKE '%strømregning%'
    OR coalesce(gpt_answer, '') ILIKE '%unødvendige kostnader%'
    OR coalesce(gpt_answer, '') ILIKE '%årlig besparelse%'
  );

COMMIT;

-- Kontrollera resultat
SELECT market, COUNT(*) AS rows
FROM public.invoice_ocr
GROUP BY market
ORDER BY rows DESC;
