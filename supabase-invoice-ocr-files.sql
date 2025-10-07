-- Skapa tabellen för att referera uppladdade fakturabilder till invoice_ocr

CREATE TABLE IF NOT EXISTS invoice_ocr_files (
  id SERIAL PRIMARY KEY,
  invoice_ocr_id INTEGER NOT NULL REFERENCES invoice_ocr(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  image_sha256 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_files_invoice_id ON invoice_ocr_files(invoice_ocr_id);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_files_created_at ON invoice_ocr_files(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoice_ocr_files_invoice_sha ON invoice_ocr_files(invoice_ocr_id, image_sha256);

-- RLS
ALTER TABLE invoice_ocr_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to read invoice_ocr_files" ON invoice_ocr_files;
DROP POLICY IF EXISTS "Allow all to insert invoice_ocr_files" ON invoice_ocr_files;
CREATE POLICY "Allow all to read invoice_ocr_files" ON invoice_ocr_files FOR SELECT USING (true);
CREATE POLICY "Allow all to insert invoice_ocr_files" ON invoice_ocr_files FOR INSERT WITH CHECK (true);

-- Kommentarer
COMMENT ON TABLE invoice_ocr_files IS 'Mappar uppladdade fakturabilder i storage till invoice_ocr poster';
COMMENT ON COLUMN invoice_ocr_files.storage_key IS 'Nyckel i storage bucket invoice-ocr';


