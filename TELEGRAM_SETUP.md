# Telegram Bot Setup til Kontaktformular

## Trin 1: Opret en Telegram Bot

1. **Åbn Telegram** og søg efter `@BotFather`
2. **Start en chat** med BotFather
3. **Send kommandoen** `/newbot`
4. **Følg instruktionerne**:
   - Angiv et navn til din bot (f.eks. "Elchef Contact Bot")
   - Angiv et brugernavn der slutter med "bot" (f.eks. "elchef_contact_bot")
5. **Gem bot token** som BotFather giver dig

## Trin 2: Find dit Chat ID

### Alternativ 1: Send besked til bot
1. **Søg efter din bot** med det brugernavn du oprettede
2. **Start en chat** med botten
3. **Send en besked** (hvad som helst)
4. **Gå til** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. **Find chat_id** i svaret

### Alternativ 2: Brug @userinfobot
1. **Søg efter** `@userinfobot`
2. **Start en chat** og send `/start`
3. **Kopier dit ID** fra svaret

## Trin 3: Konfigurer Miljøvariabler

Tilføj følgende i din `.env.local` fil:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=123456789,987654321,555666777

# Mailerlite Configuration (allerede konfigureret)
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=your_group_id
```

### Flere Chat IDs
For at sende notifikationer til flere personer, separer chat IDs med komma:
- `TELEGRAM_CHAT_IDS=123456789,987654321,555666777`
- Hver person skal have startet en chat med botten
- Du kan tilføje eller fjerne chat IDs når som helst

## Trin 4: Test Konfigurationen

1. **Start udviklingsserveren**: `npm run dev`
2. **Udfyld kontaktformularen** på din hjemmeside
3. **Kontroller Telegram** for notifikation

## Eksempel på Telegram-besked

```
🔔 Ny kontaktanmodning

📧 E-mail: anna@example.com
📞 Telefon: 012-345 67 89
📰 Nyhedsbrev: Ja

⏰ Tidspunkt: 2024-01-15 14:30:25
🌐 Kilde: Elchef.dk kontaktformular
```

## Fejlsøgning

### Bot svarer ikke
- Kontroller at bot token er korrekt
- Sørg for at du har startet en chat med botten

### Ingen notifikationer
- Verificer at TELEGRAM_CHAT_ID er korrekt
- Kontroller at botten har tilladelse til at sende beskeder

### Mailerlite-integration virker ikke
- Verificer MAILERLITE_API_KEY og MAILERLITE_GROUP_ID
- Kontroller at API-nøglen har de rigtige rettigheder

## Sikkerhed

- **Del aldrig** din bot token offentligt
- **Brug miljøvariabler** for alle følsomme data
- **Begræns bot-adgang** til kun nødvendige funktioner
