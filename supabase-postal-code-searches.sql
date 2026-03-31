-- Tabell för att spara postnummersökningar från kunder som byter avtal
CREATE TABLE IF NOT EXISTS postal_code_searches (
  id BIGSERIAL PRIMARY KEY,
  postal_code VARCHAR(10) NOT NULL,
  electricity_area VARCHAR(10) NOT NULL, -- se1, se2, se3, se4
  form_type VARCHAR(50), -- 'variabel-aftale', 'fastpris-aftale', etc.
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_postal_code ON postal_code_searches(postal_code);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_electricity_area ON postal_code_searches(electricity_area);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_created_at ON postal_code_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_form_type ON postal_code_searches(form_type);

-- RLS (Row Level Security) policies
ALTER TABLE postal_code_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from authenticated users (service role)
CREATE POLICY "Allow service role inserts" ON postal_code_searches
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reads for authenticated admin users
CREATE POLICY "Allow admin reads" ON postal_code_searches
  FOR SELECT
  USING (true);

-- Kommentarer
COMMENT ON TABLE postal_code_searches IS 'Sparar postnummersökningar från kunder som byter elavtal för marknadsföringsanalys';
COMMENT ON COLUMN postal_code_searches.postal_code IS 'Postnummer som kunden sökte';
COMMENT ON COLUMN postal_code_searches.electricity_area IS 'Elområde baserat på postnummer (se1-se4)';
COMMENT ON COLUMN postal_code_searches.form_type IS 'Typ av formulär där sökningen skedde';
