# Nyhedsbrev Setup - Mailerlite Integration

## Oversigt
Denne guide hjælper dig med at konfigurere nyhedsbrev-funktionaliteten med Mailerlite til Elchef.dk.

## Funktioner
- ✅ E-mailregistrering med validering
- ✅ Checkbox til GDPR-samtykke
- ✅ Mailerlite API-integration
- ✅ Fejlhåndtering og brugerfeedback
- ✅ Responsivt design

## Installation

### 1. Opret Mailerlite-konto
1. Gå til [Mailerlite](https://www.mailerlite.com) og opret en konto
2. Opret en gruppe kaldet "Alle typer aftaler" (eller brug eksisterende gruppe)

### 2. Hent API-nøgle
1. Log ind på Mailerlite
2. Gå til **Integrations** > **API**
3. Opret en ny API-nøgle
4. Kopier nøglen

### 3. Konfigurer miljøvariabler
Opret en `.env.local` fil i projektets rod og tilføj:

```env
# Mailerlite API Configuration
MAILERLITE_API_KEY=din_mailerlite_api_nøgle_her

# Mailerlite Group ID (valgfrit)
# Find dit gruppe-ID i Mailerlite dashboard under Subscribers > Groups
MAILERLITE_GROUP_ID=dit_gruppe_id_her
```

### 4. Find Group ID (valgfrit)
Hvis du vil bruge et specifikt gruppe-ID:
1. Gå til **Subscribers** > **Groups** i Mailerlite
2. Klik på gruppen "Alle typer aftaler"
3. Kopier Group ID fra URL'en eller gruppeindstillingerne

## Brug

### For brugere
1. Scroll ned til footeren på siden
2. Indtast din e-mailadresse
3. Afkryds boksen for at acceptere nyhedsbrev
4. Klik "Tilmeld dig"

### For udviklere
- Komponenten findes i `src/components/Newsletter.tsx`
- API-endpoint: `src/app/api/newsletter/route.ts`
- Komponenten er integreret i footeren (`src/components/Footer.tsx`)

## GDPR-compliance
- ✅ Eksplicit samtykke kræves via checkbox
- ✅ Tydelig information om hvad brugeren abonnerer på
- ✅ Mulighed for at afmelde via Mailerlite
- ✅ Information om afmelding i samtykkesteksten

## Fejlhåndtering
Systemet håndterer følgende fejl:
- Ugyldig e-mailadresse
- Allerede registreret e-mailadresse
- API-fejl fra Mailerlite
- Netværksfejl

## Testning
1. Start udviklingsserveren: `npm run dev`
2. Gå til footeren på siden
3. Test at registrere en e-mailadresse
4. Kontroller at abonnenten dukker op i Mailerlite

## Fejlsøgning

### "Konfigurationsfejl"
- Kontroller at `MAILERLITE_API_KEY` er korrekt indstillet
- Verificer at API-nøglen har de rigtige rettigheder

### "Denna e-postadress är redan registrerad"
- Detta är normalt beteende - Mailerlite tillåter inte duplicerade e-postadresser
- Användaren får tydlig feedback om detta

### API-fel
- Kontrollera Mailerlite API-status
- Verifiera att grupp-ID:t är korrekt (om använt)
- Kontrollera server-loggar för detaljerad felinformation

## Säkerhet
- API-nyckeln lagras endast i miljövariabler
- E-postadresser valideras både på klient- och serversidan
- All kommunikation sker över HTTPS
- GDPR-samtycke krävs för registrering 