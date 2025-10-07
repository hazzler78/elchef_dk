-- ============================================================================
-- FIX FÖR DUBBLETTER AV POLICIES
-- ============================================================================
-- Detta script fixar policys som redan finns genom att ta bort och återskapa dem
-- Kan köras flera gånger utan problem (idempotent)
-- ============================================================================

-- 1. Ta bort befintliga policies för invoice_ocr
DROP POLICY IF EXISTS "Allow all operations on invoice_ocr" ON invoice_ocr;

-- 2. Återskapa policy för invoice_ocr
CREATE POLICY "Allow all operations on invoice_ocr" ON invoice_ocr
  FOR ALL USING (true);

-- 3. Verifiera att RLS är aktiverat
ALTER TABLE invoice_ocr ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIX FÖR ÖVRIGA TABELLER (om samma problem uppstår)
-- ============================================================================

-- invoice_ocr_logs
DROP POLICY IF EXISTS "Allow all operations on invoice_ocr_logs" ON invoice_ocr_logs;
CREATE POLICY "Allow all operations on invoice_ocr_logs" ON invoice_ocr_logs
  FOR ALL USING (true);
ALTER TABLE invoice_ocr_logs ENABLE ROW LEVEL SECURITY;

-- contract_clicks
DROP POLICY IF EXISTS "Allow all to read contract_clicks" ON contract_clicks;
DROP POLICY IF EXISTS "Allow all to insert contract_clicks" ON contract_clicks;
CREATE POLICY "Allow all to read contract_clicks" ON contract_clicks
  FOR SELECT USING (true);
CREATE POLICY "Allow all to insert contract_clicks" ON contract_clicks
  FOR INSERT WITH CHECK (true);
ALTER TABLE contract_clicks ENABLE ROW LEVEL SECURITY;

-- page_views
DROP POLICY IF EXISTS "Allow all to read page_views" ON page_views;
DROP POLICY IF EXISTS "Allow all to insert page_views" ON page_views;
CREATE POLICY "Allow all to read page_views" ON page_views 
  FOR SELECT USING (true);
CREATE POLICY "Allow all to insert page_views" ON page_views 
  FOR INSERT WITH CHECK (true);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- customer_reminders
DROP POLICY IF EXISTS "Allow all operations for customer_reminders" ON customer_reminders;
CREATE POLICY "Allow all operations for customer_reminders" ON customer_reminders
  FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE customer_reminders ENABLE ROW LEVEL SECURITY;

-- pending_reminders
DROP POLICY IF EXISTS "Allow all operations for pending_reminders" ON pending_reminders;
CREATE POLICY "Allow all operations for pending_reminders" ON pending_reminders
  FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE pending_reminders ENABLE ROW LEVEL SECURITY;

-- affiliate_applications
DROP POLICY IF EXISTS "Allow all to insert affiliate_applications" ON affiliate_applications;
CREATE POLICY "Allow all to insert affiliate_applications" ON affiliate_applications
  FOR INSERT WITH CHECK (true);
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;

-- company_partner_applications
DROP POLICY IF EXISTS "Allow all to insert company_partner_applications" ON company_partner_applications;
CREATE POLICY "Allow all to insert company_partner_applications" ON company_partner_applications
  FOR INSERT WITH CHECK (true);
ALTER TABLE company_partner_applications ENABLE ROW LEVEL SECURITY;

-- contacts
DROP POLICY IF EXISTS "Allow all to insert contacts" ON contacts;
CREATE POLICY "Allow all to insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ai_knowledge
DROP POLICY IF EXISTS "Allow all to read ai_knowledge" ON ai_knowledge;
CREATE POLICY "Allow all to read ai_knowledge" ON ai_knowledge 
  FOR SELECT USING (true);
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;

-- ai_campaigns
DROP POLICY IF EXISTS "Allow all to read ai_campaigns" ON ai_campaigns;
CREATE POLICY "Allow all to read ai_campaigns" ON ai_campaigns 
  FOR SELECT USING (true);
ALTER TABLE ai_campaigns ENABLE ROW LEVEL SECURITY;

-- ai_providers
DROP POLICY IF EXISTS "Allow all to read ai_providers" ON ai_providers;
CREATE POLICY "Allow all to read ai_providers" ON ai_providers 
  FOR SELECT USING (true);
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFIERA ATT ALLT FUNGERAR
-- ============================================================================

-- Visa alla policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Visa alla tabeller med RLS
SELECT tablename, 
       CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

