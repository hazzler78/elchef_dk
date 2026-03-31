# Postnummersökningar - Setup Guide

## Översikt
Detta system spårar vilka postnummer kunder söker när de byter elavtal. Detta hjälper er att förstå vilka elområden som är mest populära för marknadsföring.

## Komponenter

### 1. Databastabell
**Fil:** `supabase-postal-code-searches.sql`

Skapar tabellen `postal_code_searches` som sparar:
- `postal_code`: Postnummer som kunden sökte
- `electricity_area`: Elområde baserat på postnummer (se1-se4)
- `form_type`: Typ av formulär (variabel-aftale, fastpris-aftale)
- `session_id`: Användarens sessions-ID
- `user_agent` och `referer`: Teknisk information
- `created_at`: När sökningen skedde

### 2. API Endpoint
**Fil:** `src/app/api/events/postal-code-search/route.ts`

Hanterar POST-förfrågningar för att spara postnummersökningar:
- Validerar postnummer
- Beräknar elområde baserat på postnummer
- Sparar sökningen i databasen

### 3. Tracking i Formulär
**Filer:** 
- `src/app/variabel-aftale/page.tsx`
- `src/app/fastpris-aftale/page.tsx`

Spårar när kunder anger postnummer i Salesys-formulären:
- Pollar formulärfält varje sekund i 2 minuter
- Identifierar postnummerfält baserat på fältnamn/label eller fält-ID
- Skickar postnummer till API-endpoint när det ändras

### 4. Admin Dashboard
**Fil:** `src/app/admin/postal-codes/page.tsx`

Visar statistik över postnummersökningar:
- **Populära elområden**: Visar fördelning av sökningar per elområde (se1-se4)
- **Mest sökta postnummer**: Top 10 postnummer som söks mest
- **Senaste sökningar**: Lista över de senaste 50 sökningarna
- **Datumfilter**: Filtrera på 24h, 7d, 30d, 90d eller alla

## Installation

### 1. Kör SQL-skemaet
```sql
-- Kör i Supabase SQL Editor
\i supabase-postal-code-searches.sql
```

Eller kopiera innehållet från `supabase-postal-code-searches.sql` och kör det direkt i Supabase SQL Editor.

### 2. Verifiera miljövariabler
Kontrollera att följande finns i `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Testa tracking
1. Gå till `/variabel-aftale` eller `/fastpris-aftale`
2. Fyll i formuläret och ange ett postnummer
3. Kontrollera att sökningen sparas i databasen

### 4. Öppna admin-sidan
1. Gå till `/admin/postal-codes`
2. Logga in med lösenordet: `grodan2025`
3. Se statistik över postnummersökningar

## Elområden

Postnummer mappas till elområden enligt följande:
- **SE1** (Norra Sverige): Postnummer >= 98
- **SE2** (Södra Sverige): Postnummer 85-97
- **SE3** (Mitt Sverige): Postnummer 62-84
- **SE4** (Sydvästra Sverige): Postnummer < 62

## Användning

### Visa populära elområden
1. Öppna `/admin/postal-codes`
2. Välj önskat datumfilter
3. Se fördelningen av sökningar per elområde

### Exportera data
Data kan exporteras från Supabase direkt eller via admin-sidan (kan läggas till vid behov).

## Tekniska detaljer

### Tracking-metod
Systemet använder polling för att spåra postnummer i Salesys-formulären:
- Pollar `formInstance.getFields()` varje sekund
- Identifierar postnummerfält baserat på:
  - Fältnamn/label som innehåller "postnummer", "postal", "postcode"
  - Fält-ID som matchar kända postnummerfält-ID:n
- Sparar varje unik postnummer en gång per session

### Prestanda
- Polling stoppas efter 2 minuter för att spara resurser
- Varje postnummer sparas endast en gång per session
- Använder `keepalive: true` för att säkerställa att requests skickas även om sidan stängs

## Nästa steg

För att förbättra systemet kan ni:
1. Lägga till export-funktionalitet i admin-sidan
2. Skapa diagram/visualiseringar för trender över tid
3. Lägga till notifikationer när nya områden blir populära
4. Integrera med marknadsföringsverktyg för automatiska kampanjer
