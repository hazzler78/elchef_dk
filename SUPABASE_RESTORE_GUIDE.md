# 🆘 Supabase Gendannelsesguide

## Hvad skete der?
Du koblede Supabase fra Vercel, hvilket **slettede hele din Supabase-database**. Men fortvivl ikke! Jeg har genskabt alle tabeller fra dine eksisterende SQL-filer og koden.

## 🚀 Hurtig gendannelse

### Trin 1: Opret et nyt Supabase-projekt (hvis nødvendigt)
1. Gå til [supabase.com](https://supabase.com)
2. Log ind og opret et nyt projekt
3. Vent indtil projektet er klar (~2 minutter)
4. Kopier din nye **Project URL** og **API Keys**

### Trin 2: Opdater miljøvariabler

#### I Vercel:
1. Gå til dit projekt i Vercel Dashboard
2. Gå til **Settings** → **Environment Variables**
3. Opdater følgende variabler med dine nye Supabase-oplysninger:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   SUPABASE_URL=your_new_supabase_url (samme som NEXT_PUBLIC_SUPABASE_URL)
   ```
4. Gem og deploy projektet igen

#### Lokalt (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
SUPABASE_URL=your_new_supabase_url

# Øvrige miljøvariabler (behold dine eksisterende værdier)
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_IDS=your_chat_ids
MAILERLITE_API_KEY=your_mailerlite_key
UPDATE_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key
```

### Trin 3: Gendan databasen

#### Alternativ A: Komplet gendannelse (ANBEFALET)
1. Gå til din Supabase dashboard
2. Klik på **SQL Editor** i venstremenuen
3. Klik på **New query**
4. Åbn filen `supabase-complete-restore.sql` fra dette projekt
5. Kopier HELE indholdet
6. Indsæt i SQL Editor
7. Klik på **Run** (eller tryk Ctrl+Enter)
8. Vent indtil det er klart (~30 sekunder)
9. Verificer at alle tabeller blev oprettet ved at tjekke resultatet nederst

#### Alternativ B: Trin-for-trin gendannelse
Kør følgende SQL-filer i denne rækkefølge:

1. `supabase-invoice-ocr.sql` - Hovedtabel for AI-analyse
2. `supabase-invoice-ocr-logs.sql` - Ældre logningstabell
3. `supabase-contract-clicks.sql` - Kontraktsklik og page views
4. `supabase-share-tracking.sql` - Social deling
5. Tilføj tabeller fra setup-guiderne manuelt:
   - `KNOWLEDGE_BASE_SETUP.md` - AI vidensbase
   - `REMINDER_SETUP.md` - Kundepåmindelser
   - Affiliate og partner-tabeller (se nedenfor)

### Trin 4: Verificer gendannelsen

Kør følgende SQL for at se alle dine tabeller:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Du bør se følgende **14 tabeller**:
- `ai_campaigns`
- `ai_knowledge`
- `ai_providers`
- `affiliate_applications`
- `company_partner_applications`
- `contacts`
- `contract_clicks`
- `customer_reminders`
- `invoice_ocr` ⚠️ **Hovedtabel**
- `invoice_ocr_logs`
- `page_views`
- `pending_reminders`
- `share_clicks`
- `shared_calculations`

### Trin 5: Gentilslut Vercel til Supabase

1. Gå til Vercel Dashboard → dit projekt
2. Gå til **Integrations**
3. Find **Supabase**
4. Klik på **Add Integration**
5. Vælg dit nye Supabase-projekt
6. Godkend forbindelsen

⚠️ **OBS:** Denne gang vil databasen ikke blive slettet når du tilslutter, fordi alle tabeller allerede findes!

### Trin 6: Opret Storage Bucket (til invoice-billeder)

1. Gå til **Storage** i Supabase Dashboard
2. Klik på **Create bucket**
3. Navn: `invoice-ocr`
4. **Public bucket:** NEJ (privat)
5. Klik på **Create bucket**
6. Gå til bucket-indstillinger og sæt RLS policies:

```sql
-- Policy for at tillade upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoice-ocr'
);

-- Policy for at tillade læsning
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoice-ocr'
);
```

## 📊 Data der gik tabt

Desværre har du mistet al **historisk data**:
- ❌ Alle tidligere AI-analyser af elregninger
- ❌ Kontraktsklik-statistik
- ❌ Sidevisningsdata
- ❌ Social delingsstatistik
- ❌ Kundepåmindelser
- ❌ Kontaktanmodninger
- ❌ Affiliate- og partner-ansøgninger

**Men:**
- ✅ Al din **kode** er intakt
- ✅ Al **struktur** er gendannet
- ✅ Alle **funktioner** vil fungere igen
- ✅ Nye data vil blive gemt korrekt

## 🔄 Backup-strategi for fremtiden

For at undgå dette i fremtiden, konfigurer automatiske backups:

### 1. Supabase Backups (Anbefalet)
- Supabase Pro og højere har automatiske daglige backups
- Opgrader til Pro hvis du har vigtig data

### 2. Manuelle SQL-dumps
Kør dette ugentligt:
```bash
# Installer Supabase CLI først
npx supabase db dump -f backup-$(date +%Y%m%d).sql
```

### 3. Eksport til CSV
- Gå til **Table Editor** i Supabase
- Vælg tabel
- Klik på **Export** → **CSV**
- Gem lokalt eller til Google Drive

## 🆘 Troubleshooting

### Problem: "Permission denied for table X"
**Løsning:** Kør SQL-scriptet igen, RLS policies blev måske ikke oprettet korrekt.

### Problem: "Foreign key constraint violation"
**Løsning:** Kør tabellerne i rigtig rækkefølge. Brug `supabase-complete-restore.sql` i stedet.

### Problem: "Policy already exists"
**Løsning:** Dette er OK! SQL-scriptet bruger idempotente policies (DO $$ ... END $$).

### Problem: Vercel kan ikke forbinde til Supabase
**Løsning:** 
1. Verificer at miljøvariablerne er korrekte
2. Deploy projektet igen efter du har opdateret variablerne
3. Tjek Vercel Function Logs for fejl

## 📞 Support

Hvis du støder på problemer:
1. Tjek Supabase Dashboard → **Logs** for fejl
2. Tjek Vercel → **Functions** → **Logs** for API-fejl
3. Test API-endpoints manuelt med curl
4. Kontroller at alle miljøvariabler er sat

## ✅ Tjekliste

- [ ] Nyt Supabase-projekt oprettet
- [ ] Miljøvariabler opdateret i Vercel
- [ ] Miljøvariabler opdateret i `.env.local`
- [ ] `supabase-complete-restore.sql` kørt succesfuldt
- [ ] Alle 14 tabeller findes i databasen
- [ ] Storage bucket `invoice-ocr` oprettet
- [ ] Vercel gentilsluttet til Supabase
- [ ] Projektet deployet uden fejl
- [ ] Hjemmesiden fungerer igen
- [ ] AI-analyse fungerer (test på `/sammenlign-elpriser`)
- [ ] Admin-paneler fungerer (test `/admin/invoices`)

## 💡 Erfaringer

1. **Aldrig afbryd Supabase fra Vercel** uden først at tage backup
2. **Eksporter altid data** før du laver store ændringer
3. **Brug Supabase Pro** for automatiske backups hvis du har vigtig data
4. **Gem SQL-skemaer** for alle tabeller (nu har du dem!)
5. **Test gendannelsen** regelmæssigt for at være sikker

---

**Oprettet:** 2025-10-07
**Status:** Database slettet, gendannelsesscript klar
**Næste trin:** Kør `supabase-complete-restore.sql` i Supabase SQL Editor
