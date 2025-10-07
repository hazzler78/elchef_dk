# Elchef.dk

Elchef er en dansk tjeneste til at sammenligne og skifte elaftaler – nemt, trygt og gratis. Find markedets bedste elaftaler til netop dine behov og skift direkte online.

## Funktioner
- Sammenlign elpriser i realtid baseret på postnummer
- Skift elaftale direkte via tjenesten
- Få ekspertråd og svar på ofte stillede spørgsmål
- GDPR- og cookie-kompatibel
- Mobilvenlig design med bundnavigation
- Flere informationssider (Om os, Erhverv, Kontakt, Medier, m.fl.)

## Installation & udvikling

```bash
npm install
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) i din browser.

## Byg & deploy

### Cloudflare Pages (Next.js on Pages)

For produktion på Cloudflare Pages med `@cloudflare/next-on-pages`:

1) Installer afhængigheder
```bash
npm install
```

2) Byg til Cloudflare
```bash
npm run cf:build
```

3) Lokal preview
```bash
npm run cf:preview
```

4) Deploy til Pages
```bash
npm run cf:deploy
```

Konfigurationen styres via `wrangler.toml` (angiv `account_id`, projektets navn under `[pages]`, samt miljøvariabler under `[vars]`).

### Miljøvariabler
Sæt følgende variabler i Cloudflare Pages-projektet (Production og Preview):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_IDS`
- `MAILERLITE_API_KEY`
- `MAILERLITE_GROUP_ID`
- `OPENAI_API_KEY`
- `XAI_API_KEY`

### Cron-erstatning
Tidligere Vercel-crons (`vercel.json`) erstattes af en Cloudflare Worker (`functions/cron-worker.ts`) som scheduleres via `wrangler.toml` `triggers.crons`. Den pinger:
- `/api/reminders/send`
- `/api/update-prices`

Sæt `CRON_TARGET_BASE_URL` i Pages miljøvariabler til din offentlige URL (f.eks. `https://www.elchef.dk`).

## Preview-deploy

Denne notering er tilføjet for at trigge en Vercel preview-deploy for branchen `preview-form`.

## Teknologi stack
- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [styled-components](https://styled-components.com/)
- [TypeScript]
- Hosting: Cloudflare Pages

## Kontakt
- E-mail: info@elchef.dk
- Telefon: +45 XX XX XX XX
- [elchef.dk](https://elchef.dk)

---

*Denne README er en base – fyld gerne mere info om API, Grok AI, bidrag, licens m.m. ved behov.*
