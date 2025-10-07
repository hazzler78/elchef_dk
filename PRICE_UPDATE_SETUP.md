# Automatisk prisopdatering for Elchef

## Oversigt
Denne løsning henter automatisk elpriser fra Cheap Energy's JSON-fil og opdaterer dem hver nat for at holde priserne aktuelle på hjemmesiden.

## Sådan fungerer det

### 1. API Routes
- `/api/prices` - Henter priser fra Cheap Energy (cachet i 1 time)
- `/api/update-prices` - Manuel opdatering af priser (kræver autentifikation)

### 2. Prisstruktur
Priserne hentes fra: `https://www.cheapenergy.se/Site_Priser_CheapEnergy_de.json`

**Inkluderer:**
- Variable priser (spot) for alle elområder (DK1, DK2)
- Fastprisaftaler for forskellige bindingsperioder (3, 6, 12, 24, 36, 48, 60, 120 måneder)
- Faste gebyrer

### 3. Automatisk opdatering

#### Alternativ A: Cron Job (Anbefalet)
Opret en cron job der kører hver nat kl. 00:00:

```bash
# Tilføj i crontab
0 0 * * * curl -X POST https://din-domain.dk/api/update-prices \
  -H "Authorization: Bearer DIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

#### Alternativ B: Vercel Cron Jobs
Hvis du bruger Vercel, tilføj i `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/update-prices",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Alternativ C: Ekstern tjeneste
Brug tjenester som:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [UptimeRobot](https://uptimerobot.com)

## Miljøvariabler

Tilføj i din `.env.local` fil:

```env
UPDATE_SECRET_KEY=din_hemmelige_nøgle_her
```

## Test opdateringen

### Manuel test:
```bash
curl -X POST https://din-domain.dk/api/update-prices \
  -H "Authorization: Bearer DIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Forventet svar:
```json
{
  "success": true,
  "message": "Prices updated successfully",
  "timestamp": "2025-01-27T00:00:00.000Z",
  "prices": {
    "spot": {
      "dk1": 14.08,
      "dk2": 42.94
    },
    "fixed_6m": {
      "dk1": 45.59,
      "dk2": 81.59
    },
    "fixed_12m": {
      "dk1": 44.79,
      "dk2": 78.39
    }
  }
}
```

## Logging

Alle prisopdateringer logges i konsollen med:
- ✅ Vellykket opdatering
- ❌ Fejl ved opdatering
- 📊 Aktuelle priser for alle områder

## Fejlsøgning

### Almindelige problemer:

1. **401 Unauthorized**
   - Kontroller at `UPDATE_SECRET_KEY` er korrekt sat
   - Verificer Authorization header

2. **500 Internal Server Error**
   - Kontroller at Cheap Energy's JSON-fil er tilgængelig
   - Verificer netværksforbindelse

3. **Priser vises ikke**
   - Kontroller at `/api/prices` returnerer data
   - Verificer at cache er opdateret

## Sikkerhed

- Brug en stærk `UPDATE_SECRET_KEY`
- Begræns adgang til `/api/update-prices` kun til autoriserede kilder
- Overvej at tilføje rate limiting for API'et

## Fremtidige forbedringer

- Databaselagring af prishistorik
- E-mailnotifikationer ved fejl
- Dashboard til at overvåge prisopdateringer
- Backup-priskilder
