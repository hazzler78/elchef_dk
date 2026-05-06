-- Elchef DK/SE Insights playbook
-- Read-only queries for using invoice OCR data safely.

-- 1) Data health by market
SELECT market, COUNT(*) AS analyses
FROM public.invoice_ocr
GROUP BY market
ORDER BY analyses DESC;

-- 2) Daily trend by market (last 30 days)
SELECT
  date_trunc('day', created_at) AS day,
  market,
  COUNT(*) AS analyses
FROM public.invoice_ocr
WHERE created_at >= now() - interval '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- 3) Share rate by market (analysis -> share_click)
WITH analyses AS (
  SELECT id, market
  FROM public.invoice_ocr
  WHERE created_at >= now() - interval '30 days'
),
shared AS (
  SELECT DISTINCT log_id
  FROM public.share_clicks
  WHERE log_id IS NOT NULL
    AND created_at >= now() - interval '30 days'
)
SELECT
  a.market,
  COUNT(*) AS analyses,
  COUNT(s.log_id) AS shared_analyses,
  ROUND(100.0 * COUNT(s.log_id) / NULLIF(COUNT(*), 0), 2) AS share_rate_pct
FROM analyses a
LEFT JOIN shared s ON s.log_id = a.id
GROUP BY a.market
ORDER BY analyses DESC;

-- 4) Contract-click conversion by market (analysis -> contract_click)
WITH analyses AS (
  SELECT id, market
  FROM public.invoice_ocr
  WHERE created_at >= now() - interval '30 days'
),
clicked AS (
  SELECT DISTINCT log_id
  FROM public.contract_clicks
  WHERE log_id IS NOT NULL
    AND created_at >= now() - interval '30 days'
)
SELECT
  a.market,
  COUNT(*) AS analyses,
  COUNT(c.log_id) AS converted_analyses,
  ROUND(100.0 * COUNT(c.log_id) / NULLIF(COUNT(*), 0), 2) AS conversion_pct
FROM analyses a
LEFT JOIN clicked c ON c.log_id = a.id
GROUP BY a.market
ORDER BY analyses DESC;

-- 5) Top user-visible fee terms from OCR text (simple keyword signal)
-- Helps content/ads focus on most frequent pain points.
SELECT
  market,
  SUM((gpt_answer ILIKE '%abonnement%')::int) AS abonnement_hits,
  SUM((gpt_answer ILIKE '%tillæg%' OR gpt_answer ILIKE '%påslag%')::int) AS tillaeg_paaslag_hits,
  SUM((gpt_answer ILIKE '%årsgebyr%' OR gpt_answer ILIKE '%årsavgift%')::int) AS aarsgebyr_hits
FROM public.invoice_ocr
WHERE created_at >= now() - interval '30 days'
GROUP BY market
ORDER BY market;

-- 6) Operational check: analyses that failed to get linked actions
SELECT
  i.market,
  COUNT(*) AS analyses_without_actions
FROM public.invoice_ocr i
LEFT JOIN public.share_clicks s ON s.log_id = i.id
LEFT JOIN public.contract_clicks c ON c.log_id = i.id
WHERE i.created_at >= now() - interval '7 days'
  AND s.log_id IS NULL
  AND c.log_id IS NULL
GROUP BY i.market
ORDER BY analyses_without_actions DESC;
