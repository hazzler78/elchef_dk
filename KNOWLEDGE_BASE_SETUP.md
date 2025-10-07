# AI Vidensbase Setup Guide

## Oversigt
Denne guide hjælper dig med at sætte op en dynamisk vidensbase til AI-chatten, der kan opdateres nemt uden at ændre koden.

## Database Setup

### 1. Opret tabeller i Supabase
Kør følgende SQL i Supabase SQL Editor:

```sql
-- Opret ai_knowledge tabel
CREATE TABLE ai_knowledge (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opret ai_campaigns tabel
CREATE TABLE ai_campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  validFrom DATE NOT NULL,
  validTo DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opret ai_providers tabel
CREATE TABLE ai_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('variabel', 'fastpris', 'erhverv')),
  features TEXT[] NOT NULL DEFAULT '{}',
  url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opret index for effektiv søgning
CREATE INDEX idx_knowledge_category ON ai_knowledge(category, active);
CREATE INDEX idx_knowledge_keywords ON ai_knowledge USING GIN(keywords);
CREATE INDEX idx_campaigns_dates ON ai_campaigns(validFrom, validTo, active);
CREATE INDEX idx_providers_type ON ai_providers(type, active);
```

### 2. Tilføj eksempeldata
Kør følgende SQL for at tilføje grundlæggende viden:

```sql
-- Tilføj eksempel vidensartikler
INSERT INTO ai_knowledge (category, question, answer, keywords, active) VALUES
('elaftale', 'Hvordan finder jeg gode elaftaler?', 'Registrer din e-mail i formularen i sidefoden for at få tidlige tilbud før de bliver fuldt bookede.', ARRAY['find', 'god', 'tilbud', 'registrer', 'e-mail'], true),
('elaftale', 'Hvad skal jeg vælge - Fastpris eller Variabel?', '**Fastpris**: Forudsigeligt gennem hele aftaleperioden, godt hvis du vil undgå prisschok. **Variabel**: Følger markedet, historisk billigere over tid men kan variere. Tænk: Tror du elpriserne bliver billigere eller dyrere fremover?', ARRAY['fastpris', 'variabel', 'valg', 'prisschok', 'marked'], true),
('skifte', 'Skal jeg opsige min gamle elaftale hvis jeg skifter leverandør?', 'Nej, du behøver som regel ikke at opsige din gamle elaftale selv. Når du skifter elleverandør, håndterer den nye leverandør normalt skiftet for dig, inklusive opsigelsen af din tidligere aftale.', ARRAY['opsige', 'gammel', 'aftale', 'skifte', 'leverandør'], true),
('gebyrer', 'Er der gebyr for at opsige en elaftale?', 'Variable elaftaler kan som regel opsiges uden gebyr og har normalt en opsigelsestid på en måned. Fastprisaftaler derimod har en bindingsperiode, og hvis du vil afslutte aftalen før tid, kan der komme et brudgebyr (også kaldet indfrielsesgebyr).', ARRAY['gebyr', 'opsige', 'brudgebyr', 'indfrielsesgebyr', 'bindingsperiode'], true),
('elomrader', 'Hvilket Elområde tilhører jeg?', 'Danmark er inddelt i to elområder: **DK1** - Vest for Storebælt, **DK2** - Øst for Storebælt. Hvilket elområde du tilhører afhænger af hvor du bor og påvirker elprisen i din region.', ARRAY['elområde', 'DK1', 'DK2', 'region'], true),
('fortrydelsesret', 'Kan jeg fortryde min elaftale?', 'Ja, ifølge fortrydelsesloven har du fortrydelsesret i 14 dage når du indgår en aftale på distancesalg. Det betyder at du kan fortryde aftalen uden omkostninger inden for denne periode. Undtagelse: betalt forbrug el i fortrydelsesperioden.', ARRAY['fortryde', 'aftale', '14 dage', 'fortrydelsesloven', 'omkostning'], true);

-- Tilføj eksempel kampagner
INSERT INTO ai_campaigns (title, description, validFrom, validTo, active) VALUES
('Variabel aftale - 0 kr i gebyrer', '0 kr i gebyrer første år – uden bindingsperiode', '2025-01-01', '2025-12-31', true),
('Fastprisaftale med prisgaranti', 'Prisgaranti med valgfri bindingsperiode (1-3 år)', '2025-01-01', '2025-12-31', true),
('Erhvervsaftale via Energi2.se', 'Særlige erhvervsaftaler for virksomheder', '2025-01-01', '2025-12-31', true);

-- Tilføj eksempel leverandører
INSERT INTO ai_providers (name, type, features, url, active) VALUES
('Cheap Energy', 'variabel', ARRAY['0 kr månedligt gebyr', '0 øre tillæg', 'Ingen bindingsperiode'], 'https://www.cheapenergy.se/elchef-variabel/', true),
('Svealands Elbolag', 'fastpris', ARRAY['Prisgaranti', 'Valgfri bindingsperiode', 'Ingen skjulte gebyrer'], 'https://www.svealandselbolag.se/elchef-fastpris/', true),
('Energi2.se', 'erhverv', ARRAY['Erhvervsaftaler', 'Skræddersyede løsninger', 'Mængderabatter'], 'https://energi2.se/elchef/', true);
```

## Brug

### 1. Admin-side
Gå til `/admin/knowledge` for at administrere vidensbasen:
- **Password**: `grodan2025`
- **Vidensartikler**: Tilføj, rediger eller slet FAQ-artikler
- **Kampagner**: Administrer aktive kampagner og tilbud
- **Leverandører**: Opdater leverandørinformation

### 2. Automatisk opdatering
Vidensbasen opdateres automatisk når du:
- Tilføjer nye vidensartikler
- Aktiverer/deaktiverer kampagner
- Opdaterer leverandørinformation

### 3. AI-chatten bruger vidensbasen
AI-chatten vil automatisk:
- Hente aktuel information fra databasen
- Give svar baseret på den seneste vidensbase
- Inkludere aktuelle kampagner og tilbud

## Fordele ved denne løsning

✅ **Nem opdatering**: Opdater viden uden at ændre kode
✅ **Realtidsinformation**: AI'en får altid seneste information
✅ **Struktureret data**: Organiseret vidensbase med kategorier
✅ **Admin-grænseflade**: Brugervenligt interface til opdateringer
✅ **Automatisk synkronisering**: Ingen genstart af serveren kræves

## Fremtidig udbygning

### 1. API-integration
Opret API-endpoints for at:
- Hente viden baseret på nøgleord
- Få aktuelle kampagner
- Hente leverandørinformation

### 2. Automatisk opdatering
Implementer:
- Planlagte opdateringer
- Webhook-integration
- Import fra eksterne kilder

### 3. Analyse og rapporter
Tilføj:
- Brugsstatistik
- Populære spørgsmål
- Effektivitetsmåling

## Fejlsøgning

### Almindelige problemer:

**"Table does not exist"**
- Kontroller at du kørte SQL-koden i den rigtige database
- Verificer at tabellerne blev oprettet korrekt

**"Permission denied"**
- Kontroller at din Supabase-nøgle har de rigtige rettigheder
- Verificer RLS-policies hvis de er aktiveret

**"Data not loading"**
- Kontroller netværksforbindelsen
- Verificer at miljøvariablerne er korrekt indstillet

## Support

Hvis du støder på problemer:
1. Kontroller Supabase-loggene
2. Verificer databaseforbindelsen
3. Test med en simpel forespørgsel først
4. Kontroller at alle tabeller findes og har korrekt struktur
