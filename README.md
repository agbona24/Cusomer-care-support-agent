# 🦷 Dental Voice Agent

AI-powered voice assistant for dental clinic appointment management. Handles inbound and outbound calls, books appointments, and manages rescheduling - all through natural conversation.

## Features

- ✅ **Receive Calls** - Answer incoming calls with AI voice assistant
- ✅ **Make Calls** - Initiate outbound calls for confirmations/reminders  
- ✅ **Book Appointments** - Natural language appointment booking
- ✅ **Reschedule** - Handle appointment changes on the call
- ✅ **Cancel** - Process cancellation requests
- ✅ **CRM** - Store patient info and appointment history

## Tech Stack

- **Next.js 14** - React framework (deployed on Vercel)
- **Twilio** - Phone calls and voice
- **OpenAI GPT-4o** - Conversational AI
- **OpenAI Whisper** - Speech-to-text
- **OpenAI TTS** - Text-to-speech
- **Turso** - SQLite database (serverless)
- **Drizzle ORM** - Database queries

## Quick Start

### 1. Clone and Install

```bash
cd Cusomer-care-support-agent
npm install
```

### 2. Set Up Turso Database (Free)

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Login
turso auth login

# Create database
turso db create dental-voice-agent

# Get connection details
turso db show dental-voice-agent --url
turso db tokens create dental-voice-agent
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Twilio (from console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (from platform.openai.com)
OPENAI_API_KEY=sk-xxxxxxxxxx

# Turso (from step 2)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token

# Your app URL (update after deploying)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database Schema

```bash
npm run db:push
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Expose Local Server (for testing)

Use ngrok to expose your local server to Twilio:

```bash
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 7. Configure Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Click your phone number
4. Under "Voice Configuration":
   - **When a call comes in**: Webhook
   - **URL**: `https://your-ngrok-url/api/twilio/voice`
   - **HTTP Method**: POST
5. Save

### 8. Test It!

Call your Twilio phone number and talk to Sarah! 🎉

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/dental-voice-agent.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables (same as `.env`)
4. Deploy!

### 3. Update Twilio Webhooks

Replace ngrok URL with your Vercel URL:
- `https://your-app.vercel.app/api/twilio/voice`

---

## API Endpoints

### Twilio Webhooks (internal)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/twilio/voice` | POST | Handle incoming calls |
| `/api/twilio/process` | POST | Process speech input |
| `/api/twilio/status` | POST | Call status updates |

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments` | GET | List appointments |
| `/api/appointments` | POST | Create appointment |
| `/api/appointments/[id]` | PATCH | Reschedule |
| `/api/appointments/[id]` | DELETE | Cancel |
| `/api/calls/outbound` | POST | Make outbound call |
| `/api/calls` | GET | Get call logs |

---

## Customization

### Change Clinic Info

Edit the system prompt in `src/lib/openai/client.ts`:

```typescript
export const DENTAL_ASSISTANT_PROMPT = `
You are Sarah, a friendly assistant for [YOUR CLINIC NAME]...
`;
```

### Change Voice

Edit `src/lib/twilio/twiml.ts`:

```typescript
// Available Polly voices: Joanna, Matthew, Amy, Brian, etc.
voice: 'Polly.Joanna'
```

### Change Business Hours

Edit `src/lib/db/queries.ts`:

```typescript
const allSlots = [
  '09:00', '09:30', // Add or remove time slots
];
```

---

## Troubleshooting

### "No speech detected"
- Check microphone permissions
- Ensure Twilio speech recognition is enabled

### Webhook errors
- Verify your URL is publicly accessible
- Check Twilio debugger for errors

### Database errors
- Run `npm run db:push` to sync schema
- Check Turso dashboard for connection issues

---

## License

MIT
