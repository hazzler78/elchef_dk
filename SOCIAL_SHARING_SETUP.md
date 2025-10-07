# Social Deling af AI-Beregninger - Setup Guide

## 🎯 Oversigt

Dette system lader brugere dele deres AI-beregninger fra `/sammenlign-elpriser` på sociale medier, hvilket skaber viral markedsføring og øger trafik til jeres hjemmeside.

## 🚀 Funktioner

### 1. **Automatisk Deling efter AI-analyse**
- Delingsknapper vises efter at brugeren har fået sin AI-analyse
- Automatisk ekstraktion af besparelsesbeløb fra analysen
- Platformsspecifikke tekster for Facebook, Instagram, LinkedIn og Twitter

### 2. **Unikke Delingsl Links**
- Hver deling får et unikt link: `elchef.dk/delt-beregning?id={logId}`
- Delte beregninger vises på en dedikeret side
- Automatisk rensning af gamle delinger (30 dage)

### 3. **Sporing og Analytics**
- Sporer hvilke platforme der bruges mest
- Måler besparelsesbeløb for delte beregninger
- Kobler delinger til oprindelige AI-analyser

## 📁 Filer der er oprettet

### Komponenter
- `src/components/ShareResults.tsx` - Hovedkomponent for social deling
- `src/app/delt-beregning/page.tsx` - Side for at vise delte beregninger

### API'er
- `src/app/api/events/share-click/route.ts` - Sporer delinger

### Database
- `supabase-share-tracking.sql` - SQL schema for sporing

## 🛠 Installation

### 1. Kør SQL-skemaet
```sql
-- Kør supabase-share-tracking.sql i din Supabase SQL editor
```

### 2. Opdater miljøvariabler
Ingen nye miljøvariabler behøves - bruger eksisterende Supabase-konfiguration.

### 3. Test funktionaliteten
1. Gå til `/sammenlign-elpriser`
2. Upload en elregning og få AI-analyse
3. Klik på "Del resultat" efter analysen
4. Test deling på forskellige platforme

## 📊 Forventede Resultater

### Delingstekster per platform:

**Facebook/LinkedIn:**
```
💡 AI-analyse af min elregning viser at jeg betaler 2,400 kr/år i unødvendige gebyrer!

🔍 Test selv på elchef.dk/sammenlign-elpriser

#Elbesparelse #AI #Elchef
```

**Instagram:**
```
💡 AI-analyse af min elregning viser at jeg betaler 2,400 kr/år i unødvendige gebyrer!

🔍 Test selv på elchef.dk/sammenlign-elpriser

#Elbesparelse #AI #Elchef #Energi
```

**Twitter:**
```
💡 AI-analyse af min elregning viser at jeg betaler 2,400 kr/år i unødvendige gebyrer!

🔍 Test selv: elchef.dk/sammenlign-elpriser

#Elbesparelse #AI #Elchef
```

## 🎨 Tilpasningsmuligheder

### 1. **Tilpas delingstekster**
Rediger `generateShareText()` i `ShareResults.tsx` for at ændre teksterne.

### 2. **Tilføj flere platforme**
Tilføj nye platforme i `handleShare()` funktionen.

### 3. **Forbedre delte beregninger**
Opdater `delt-beregning/page.tsx` for at vise mere detaljeret information.

## 📈 Analytics og Sporing

### Sporet data:
- **Platform** - Hvor delingen skete
- **Besparelsesbeløb** - Hvor meget brugeren kan spare
- **Session ID** - Kobler til oprindelig analyse
- **Timestamp** - Hvornår delingen skete

### Supabase-tabeller:
- `share_clicks` - Sporer alle delinger
- `shared_calculations` - Gemmer delte beregninger (fremtidig funktionalitet)

## 🔒 Sikkerhed og Integritet

- **Anonyme delinger** - Ingen personoplysninger gemmes
- **Begrænset levetid** - Delte beregninger fjernes efter 30 dage
- **RLS-policies** - Sikker databaseadgang
- **Ingen følsom data** - Kun besparelsesbeløb og metadata

## 🚀 Fremtidige Forbedringer

### 1. **Visuelle Grafik**
- Generer automatiske grafer over omkostningsfordeling
- Opret Instagram Stories-templates
- Visuelle besparelsesdiagrammer

### 2. **Avanceret Sporing**
- Spor konvertering fra delinger til nye brugere
- A/B-testning af delingstekster
- ROI-analyse for social deling

### 3. **Gamification**
- Pointsystem for delinger
- Badges for "besparelsesambassadører"
- Leaderboards for mest delte beregninger

## 🎯 Markedsføringsstrategi

### 1. **Viral Koefficient**
- Hver deling eksponerer Elchef for nye brugere
- Besparelsesbeløb skaber FOMO (Fear of Missing Out)
- Social proof gennem delte resultater

### 2. **Indholdsmarkedsføring**
- Delte beregninger bliver brugergenereret indhold
- Forskellige besparelsesbeløb skaber variation
- Hashtags øger synlighed

### 3. **Konverteringsoptimering**
- Delte beregninger fører tilbage til beregneren
- "Test selv"-CTA på hver deling
- Social proof øger tillid

## 📞 Support

For spørgsmål eller problemer med social deling, kontakt udviklingsteamet eller opret en issue i projektet.
