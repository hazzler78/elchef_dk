# 🆘 Supabase Återställningsguide

## Vad hände?
Du kopplade bort Supabase från Vercel, vilket **raderade hela din Supabase-databas**. Men oroa dig inte! Jag har återskapat alla tabeller från dina befintliga SQL-filer och koden.

## 🚀 Snabb återställning

### Steg 1: Skapa ett nytt Supabase-projekt (om nödvändigt)
1. Gå till [supabase.com](https://supabase.com)
2. Logga in och skapa ett nytt projekt
3. Vänta tills projektet är klart (tar ~2 minuter)
4. Kopiera din nya **Project URL** och **API Keys**

### Steg 2: Uppdatera miljövariabler

#### I Vercel:
1. Gå till ditt projekt i Vercel Dashboard
2. Gå till **Settings** → **Environment Variables**
3. Uppdatera följande variabler med dina nya Supabase-uppgifter:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   SUPABASE_URL=your_new_supabase_url (samma som NEXT_PUBLIC_SUPABASE_URL)
   ```
4. Spara och deploy om projektet

#### Lokalt (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
SUPABASE_URL=your_new_supabase_url

# Övriga miljövariabler (behåll dina befintliga värden)
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_IDS=your_chat_ids
MAILERLITE_API_KEY=your_mailerlite_key
UPDATE_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key
```

### Steg 3: Återställ databasen

#### Alternativ A: Komplett återställning (REKOMMENDERAT)
1. Gå till din Supabase dashboard
2. Klicka på **SQL Editor** i vänstermenyn
3. Klicka på **New query**
4. Öppna filen `supabase-complete-restore.sql` från detta projekt
5. Kopiera HELA innehållet
6. Klistra in i SQL Editor
7. Klicka på **Run** (eller tryck Ctrl+Enter)
8. Vänta tills det är klart (~30 sekunder)
9. Verifiera att alla tabeller skapades genom att kolla resultatet längst ner

#### Alternativ B: Steg-för-steg återställning
Kör följande SQL-filer i denna ordning:

1. `supabase-invoice-ocr.sql` - Huvudtabell för AI-analys
2. `supabase-invoice-ocr-logs.sql` - Äldre loggningstabell
3. `supabase-contract-clicks.sql` - Kontraktsklick och page views
4. `supabase-share-tracking.sql` - Social delning
5. Lägg till tabeller från setup-guiderna manuellt:
   - `KNOWLEDGE_BASE_SETUP.md` - AI kunskapsbas
   - `REMINDER_SETUP.md` - Kundpåminnelser
   - Affiliate och partner-tabeller (se nedan)

### Steg 4: Verifiera återställningen

Kör följande SQL för att se alla dina tabeller:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Du bör se följande **14 tabeller**:
- `ai_campaigns`
- `ai_knowledge`
- `ai_providers`
- `affiliate_applications`
- `company_partner_applications`
- `contacts`
- `contract_clicks`
- `customer_reminders`
- `invoice_ocr` ⚠️ **Huvudtabell**
- `invoice_ocr_logs`
- `page_views`
- `pending_reminders`
- `share_clicks`
- `shared_calculations`

### Steg 5: Återanslut Vercel till Supabase

1. Gå till Vercel Dashboard → ditt projekt
2. Gå till **Integrations**
3. Leta upp **Supabase**
4. Klicka på **Add Integration**
5. Välj ditt nya Supabase-projekt
6. Godkänn anslutningen

⚠️ **OBS:** Den här gången kommer inte databasen att raderas när du kopplar, eftersom alla tabeller redan finns!

### Steg 6: Skapa Storage Bucket (för invoice-bilder)

1. Gå till **Storage** i Supabase Dashboard
2. Klicka på **Create bucket**
3. Namn: `invoice-ocr`
4. **Public bucket:** NEJ (privat)
5. Klicka på **Create bucket**
6. Gå till bucket-inställningar och sätt RLS policies:

```sql
-- Policy för att tillåta upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoice-ocr'
);

-- Policy för att tillåta läsning
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoice-ocr'
);
```

## 📊 Data som förlorades

Tyvärr har du förlorat all **historisk data**:
- ❌ Alla tidigare AI-analyser av elräkningar
- ❌ Kontraktsklick-statistik
- ❌ Sidvisnings-data
- ❌ Social delnings-statistik
- ❌ Kundpåminnelser
- ❌ Kontaktförfrågningar
- ❌ Affiliate- och partner-ansökningar

**Men:**
- ✅ All din **kod** är intakt
- ✅ All **struktur** är återställd
- ✅ Alla **funktioner** kommer att fungera igen
- ✅ Nya data kommer att sparas korrekt

## 🔄 Backup-strategi för framtiden

För att undvika detta i framtiden, konfigurera automatiska backups:

### 1. Supabase Backups (Rekommenderat)
- Supabase Pro och högre har automatiska dagliga backups
- Uppgradera till Pro om du har viktig data

### 2. Manuella SQL-dumps
Kör detta veckovis:
```bash
# Installera Supabase CLI först
npx supabase db dump -f backup-$(date +%Y%m%d).sql
```

### 3. Export till CSV
- Gå till **Table Editor** i Supabase
- Välj tabell
- Klicka på **Export** → **CSV**
- Spara lokalt eller till Google Drive

## 🆘 Troubleshooting

### Problem: "Permission denied for table X"
**Lösning:** Kör SQL-scriptet igen, RLS policies kanske inte skapades korrekt.

### Problem: "Foreign key constraint violation"
**Lösning:** Kör tabellerna i rätt ordning. Använd `supabase-complete-restore.sql` istället.

### Problem: "Policy already exists"
**Lösning:** Detta är OK! SQL-scriptet använder idempotenta policies (DO $$ ... END $$).

### Problem: Vercel kan inte ansluta till Supabase
**Lösning:** 
1. Verifiera att miljövariablerna är korrekta
2. Deploy om projektet efter att du uppdaterat variablerna
3. Kolla Vercel Function Logs för fel

## 📞 Support

Om du stöter på problem:
1. Kolla Supabase Dashboard → **Logs** för fel
2. Kolla Vercel → **Functions** → **Logs** för API-fel
3. Testa API-endpoints manuellt med curl
4. Kontrollera att alla miljövariabler är satta

## ✅ Checklista

- [ ] Nytt Supabase-projekt skapat
- [ ] Miljövariabler uppdaterade i Vercel
- [ ] Miljövariabler uppdaterade i `.env.local`
- [ ] `supabase-complete-restore.sql` kördes framgångsrikt
- [ ] Alla 14 tabeller finns i databasen
- [ ] Storage bucket `invoice-ocr` skapad
- [ ] Vercel återansluten till Supabase
- [ ] Projektet deployas utan fel
- [ ] Hemsidan fungerar igen
- [ ] AI-analys fungerar (testa på `/jamfor-elpriser`)
- [ ] Admin-paneler fungerar (testa `/admin/invoices`)

## 💡 Lärdomar

1. **Aldrig koppla bort Supabase från Vercel** utan att först ta backup
2. **Exportera alltid data** innan du gör stora ändringar
3. **Använd Supabase Pro** för automatiska backups om du har viktiga data
4. **Spara SQL-scheman** för alla tabeller (nu har du dem!)
5. **Testa återställningen** regelbundet för att vara säker

---

**Skapad:** 2025-10-07
**Status:** Databas raderad, återställningsscript redo
**Nästa steg:** Kör `supabase-complete-restore.sql` i Supabase SQL Editor

