# Kundpåmindelses System - Setup Guide

## Oversigt
Dette system hjælper dig med at minde kunder om at forny deres elaftaler inden de overgår til dyrere løbende aftaler. Systemet sender automatiske Telegram-notifikationer 11 måneder før aftalen udløber.

**Ny workflow:**
1. Kunde kontakter jer via kontaktformularen
2. I får Telegram-notifikation om ny kontaktanmodning
3. I svarer på Telegram-beskeden med aftaletype og startdato
4. Systemet opretter automatisk en påmindelse baseret på jeres svar

## Funktioner
- ✅ Automatisk påmindelse 11 måneder før aftaleudløb
- ✅ Support for forskellige aftaletyper (12, 24, 36 måneder)
- ✅ Telegram-notifikationer til dit team
- ✅ Interaktive svar via Telegram for at oprette påmindelser
- ✅ Databaselagring af alle påmindelser
- ✅ Integration med kontaktformularen

## Database Setup

### 1. Opret tabeller i Supabase
Kør følgende SQL i Supabase SQL Editor:

```sql
-- Opret customer_reminders tabel
CREATE TABLE customer_reminders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('12_months', '24_months', '36_months', 'variable')),
  contract_start_date DATE NOT NULL,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opret pending_reminders tabel for ventende kontaktanmodninger
CREATE TABLE pending_reminders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opret index for effektiv søgning
CREATE INDEX idx_reminder_date ON customer_reminders(reminder_date, is_sent);
CREATE INDEX idx_customer_email ON customer_reminders(email);
CREATE INDEX idx_pending_created_at ON pending_reminders(created_at);

-- Aktiver Row Level Security (valgfrit)
ALTER TABLE customer_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_reminders ENABLE ROW LEVEL SECURITY;

-- Opret RLS-policies for customer_reminders
CREATE POLICY "Allow all operations for customer_reminders" ON customer_reminders
  FOR ALL USING (true) WITH CHECK (true);

-- Opret RLS-policies for pending_reminders  
CREATE POLICY "Allow all operations for pending_reminders" ON pending_reminders
  FOR ALL USING (true) WITH CHECK (true);
```

## Miljøvariabler

Tilføj følgende i din `.env.local` fil:

```env
# Supabase Configuration (allerede konfigureret)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram Bot Configuration (allerede konfigureret)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_IDS=123456789,987654321

# Reminder System
UPDATE_SECRET_KEY=your_secret_key_for_cron_jobs
NEXT_PUBLIC_BASE_URL=https://din-domain.dk
```

## Telegram Webhook Setup

### 1. Konfigurer webhook
Efter at du har deployet til Vercel, kør følgende kommando for at sætte webhook:

```bash
curl -X GET "https://din-domain.dk/api/telegram-webhook"
```

### 2. Test webhook
Send en testbesked til din bot for at verificere at webhook fungerer.

## API Endpoints

### 1. Kontaktformular
**POST** `/api/contact`
Sender Telegram-notifikation og opretter pending reminder.

### 2. Telegram Webhook
**POST** `/api/telegram-webhook`
Håndterer svar fra teamet og opretter påmindelser.

### 3. Opret påmindelse manuelt
**POST** `/api/reminders`
```json
{
  "customer_name": "Anna Andersen",
  "email": "anna@example.com",
  "phone": "012-345 67 89",
  "contract_type": "12_months",
  "contract_start_date": "2025-01-15",
  "notes": "Manuelt oprettet"
}
```

### 4. Hent påmindelser for i dag
**GET** `/api/reminders`
Returnerer alle påmindelser der skal sendes i dag.

### 5. Send påmindelser
**POST** `/api/reminders/send`
Kontrollerer og sender alle påmindelser der er forfaldne i dag.

## Automatisk kørsel

### Alternativ A: Cron Job (Anbefalet)
Opret en cron job der kører hver dag kl. 09:00:

```bash
# Tilføj i crontab
0 9 * * * curl -X POST https://din-domain.dk/api/reminders/send \
  -H "Authorization: Bearer DIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Alternativ B: Vercel Cron Jobs
Tilføj i `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Alternativ C: Ekstern tjeneste
Brug tjenester som:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [UptimeRobot](https://uptimerobot.com)

## Brug

### 1. Kunde kontakter jer
Når kunder udfylder kontaktformularen sendes en Telegram-notifikation til dit team.

### 2. I svarer via Telegram
Svar på Telegram-beskeden med formatet:
- `12m 2025-02-15` (12 måneders aftale der starter 15. februar 2025)
- `24m 2025-02-15` (24 måneders aftale der starter 15. februar 2025)
- `36m 2025-02-15` (36 måneders aftale der starter 15. februar 2025)

### 3. Systemet opretter påmindelse
Når I svarer oprettes automatisk en påmindelse som sendes 11 måneder før aftaleudløb.

## Fejlsøgning

### Almindelige problemer:

1. **Ingen påmindelser sendes**
   - Kontroller at `UPDATE_SECRET_KEY` er korrekt sat
   - Verificer at `TELEGRAM_BOT_TOKEN` er gyldig
   - Kontroller at `TELEGRAM_CHAT_IDS` indeholder rigtige chat-ID'er
   - Test manuelt med admin-panelet

2. **Forsinkede påmindelser**
   - Brug "Marker forsinkede som sendte" i admin-panelet
   - Kontroller at cron job kører regelmæssigt
   - Verificer at API'et fungerer med manuel test

3. **Telegram-beskeder kommer ikke frem**
   - Verificer at bot-token er korrekt
   - Kontroller at chat-ID'er er rigtige
   - Test bot-beskeder manuelt

## Sikkerhed

- Brug en stærk `UPDATE_SECRET_KEY`
- Begræns adgang til API'er kun til autoriserede kilder
- Overvej at tilføje rate limiting
- Brug HTTPS for alle API-kald
- Verificer Telegram webhook-signaturer (kan tilføjes senere)

## Fremtidige forbedringer

- E-mailnotifikationer som backup
- Dashboard til at administrere påmindelser
- Mulighed for at planlægge flere påmindelser
- Integration med CRM-system
- Statistik og rapporter
- Telegram webhook-signaturverifikation
