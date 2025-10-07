-- Skapa invoice_ocr tabellen (huvudtabell för AI-analys)
-- OBS: Denna tabell saknade tidigare en dedikerad SQL-fil!
-- Den är INTE samma som invoice_ocr_logs (äldre tabell)

CREATE TABLE IF NOT EXISTS invoice_ocr (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  user_agent TEXT,
  file_mime VARCHAR(100),
  file_size INTEGER,
  image_sha256 TEXT,
  model VARCHAR(50),
  system_prompt_version VARCHAR(100),
  gpt_answer TEXT,
  is_correct BOOLEAN,
  correction_notes TEXT,
  corrected_total_extra DECIMAL(10,2),
  corrected_savings DECIMAL(10,2),
  consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_session_id ON invoice_ocr(session_id);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_created_at ON invoice_ocr(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_image_sha256 ON invoice_ocr(image_sha256);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_consent ON invoice_ocr(consent);

-- RLS (Row Level Security)
ALTER TABLE invoice_ocr ENABLE ROW LEVEL SECURITY;

-- Policy för invoice_ocr - tillåt alla operationer
CREATE POLICY "Allow all operations on invoice_ocr" ON invoice_ocr
  FOR ALL USING (true);

-- Kommentarer för dokumentation
COMMENT ON TABLE invoice_ocr IS 'Huvudtabell för AI-analys av elräkningar med GPT-4';
COMMENT ON COLUMN invoice_ocr.session_id IS 'Session-ID för att koppla flera analyser från samma användare';
COMMENT ON COLUMN invoice_ocr.image_sha256 IS 'SHA256 hash av bilden för deduplikering';
COMMENT ON COLUMN invoice_ocr.model IS 'AI-modell som användes (t.ex. gpt-4o)';
COMMENT ON COLUMN invoice_ocr.system_prompt_version IS 'Version av system prompt som användes';
COMMENT ON COLUMN invoice_ocr.gpt_answer IS 'Komplett svar från GPT';
COMMENT ON COLUMN invoice_ocr.is_correct IS 'Feedback från admin om analysen var korrekt';
COMMENT ON COLUMN invoice_ocr.consent IS 'Om användaren gett samtycke till att spara bilden';

