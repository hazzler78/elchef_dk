# Kontrakts-klik tracking Setup

## Oversigt
Dette system sporer klik på "Variabel aftale" og "Fast

pris" knapperne fra brugere, der har fået AI-analyse på `/sammenlign-elpriser` siden. Dette giver indsigt i hvor mange der går videre fra AI-analyse til faktisk at vælge en aftale.

## Komponenter

### 1. API Endpoint
**Fil:** `src/app/api/events/contract-click/route.ts`

Sporer kontraktsklik og gemmer følgende data:
- `contract_type`: 'variabel' eller 'fastpris'
- `log_id`: Reference til AI-analysen (kan være null)
- `savings_amount`: Besparelsesbeløb fra AI-analysen
- `session_id`: Brugerens sessions-ID
- `source`: Hvorfra klikket kom (default: 'sammenlign-elpriser')
- UTM-parametre til kampagnesporing
- User agent og referer

### 2. Database Schema
**Fil:** `supabase-contract-clicks.sql`

Opretter tabellen `contract_clicks` med:
- Foreign key til `invoice_ocr` for at koble til AI-analyser
- Index for bedre performance
- RLS (Row Level Security) policies
- Cleanup-funktion for gamle poster

### 3. Tracking på /sammenlign-elpriser
**Fil:** `src/app/sammenlign-elpriser/page.tsx`

Opdaterede knapper som:
- Kalder `trackContractClick()` før navigering
- Udtrækker besparelsesbeløb fra AI-analysen
- Sender al relevant kontekstdata

### 4. Admin Dashboard
**Fil:** `src/app/admin/contract-clicks/page.tsx`

Viser statistik over:
- Totalt antal klik på kontraktsknapper
- Fordeling mellem variabel/fastpris
- Antal klik fra brugere med AI-analyse
- Gennemsnitlig besparelse
- Konverteringsrate (AI-analyse → kontraktsklik)
- Kvalitet af klik (andelen med AI-analyse)
- Detaljeret liste over seneste klik

## Installation

### 1. Kør SQL-skemaet
```sql
-- Kør i Supabase SQL Editor
\i supabase-contract-clicks.sql
```

### 2. Verificer miljøvariabler
Kontroller at følgende findes i `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test tracking
1. Gå til `/sammenlign-elpriser`
2. Upload en faktura og få AI-analyse
3. Klik på "Variabel aftale" eller "Fastpris"
4. Kontroller i admin-panelet `/admin/contract-clicks`

## Brug

### Admin Dashboard
Gå til `/admin/contract-clicks` for at se:
- **Totalt klik**: Alle kontraktsklik
- **Variabel aftale**: Antal klik på variabel aftale
- **Fastpris**: Antal klik på fastpris
- **Med AI-analyse**: Klik fra brugere der har fået AI-analyse
- **Gennemsnitlig besparelse**: Gennemsnit af besparelsesbeløb
- **Konverteringsrate**: Procent der går fra AI-analyse til kontraktsklik

### Filtrering
Brug datofilter for at se data for forskellige perioder:
- Seneste 7 dage
- Seneste 30 dage  
- Seneste 90 dage
- Alle tider

## Dataanalyse

### Vigtige KPI'er
1. **Konverteringsrate**: Hvor mange % af AI-brugere klikker på kontraktsknapper
2. **Fordeling**: Hvilken type aftale der er mest populær
3. **Besparelseskorrelation**: Om højere besparelser fører til flere klik
4. **Tidsmønster**: Når brugere klikker (tid på dagen/ugen)

### Eksempel på indsigter
- "Af 100 AI-analyser klikker 25% på kontraktsknapper"
- "Variabel aftale er 60% mere populær end fastpris"
- "Brugere med >1000 kr besparelse klikker 40% oftere"

## Tekniske Detaljer

### Tracking-metode
- Bruger `navigator.sendBeacon()` for bedre pålidelighed
- Fallback til `fetch()` hvis sendBeacon ikke understøttes
- Asynkron tracking som ikke blokerer navigering

### Datasikkerhed
- RLS policies tillader alle at læse/skrive til tracking
- Følsom data (session_id) gemmes men vises kun delvist i admin
- Automatisk cleanup af gamle poster (1 år)

### Performance
- Index på vigtige kolonner for hurtige queries
- Begrænsning til 100 seneste poster i admin-listen
- Effektive database-queries med filtrering

## Fejlsøgning

### Almindelige problemer
1. **Ingen klik spores**: Kontroller at API-endpointet fungerer
2. **Fejl i admin**: Verificer Supabase-forbindelse og RLS policies
3. **Manglende AI-koblinger**: Kontroller at `log_id` gemmes korrekt

### Debugging
```javascript
// Kontroller i browser console
console.log('Session ID:', localStorage.getItem('invoiceSessionId'));
console.log('Log ID:', logId);
```

## Fremtidige Forbedringer

### Mulige tilføjelser
1. **A/B-testning**: Forskellige knaptekster og farver
2. **Heatmaps**: Hvor brugere klikker på siden
3. **Funnel-analyse**: Trin-for-trin konvertering
4. **E-mailopfølgning**: Kontakt brugere der ikke klikkede
5. **Realtids-dashboard**: Live statistik med WebSocket

### Integrationer
- Google Analytics for dybere analyse
- Email-marketing for opfølgning
- CRM-system for lead-håndtering
