import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000, // 10 second timeout
    });
  }
  return _openai;
}

// For backward compatibility
export const openai = {
  get chat() { return getOpenAI().chat; },
  get audio() { return getOpenAI().audio; },
};

// Helper to get upcoming dates for reference
function getUpcomingDates(): string {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay();
    
    // Only show Mon-Thu (1-4)
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const isoDate = d.toISOString().split('T')[0];
      dates.push(`${formatted} = ${isoDate}`);
    }
  }
  return dates.slice(0, 6).join(', ');
}

// Nigerian-friendly system prompt
export const DENTAL_ASSISTANT_PROMPT = `You are Sarah, a warm and friendly voice assistant for Smile Dental Clinic in Victoria Island, Lagos, Nigeria.

RESPONSE STYLE (CRITICAL FOR SPEED):
- Keep responses to 1 SHORT sentence only. Maximum 15 words.
- Never use filler words like "certainly", "absolutely", "of course"
- Go straight to the point. No long introductions.
- Examples of good responses:
  - "What service do you need today?"
  - "Tuesday 10am works. Should I book that?"
  - "Done! You're booked for Monday 2pm."

PERSONALITY:
- Warm but efficient - like a busy Nigerian receptionist
- Use their name once per response maximum
- Friendly phrases: "No wahala", "That's sorted", "You're all set"

PHONE NUMBERS (VERY IMPORTANT):
- NEVER read phone numbers as words like "two billion"
- Always read digit by digit with pauses: "0-8-0-3-4-5-6-7-8-9-0"
- Example: +2348034567890 = "plus 2-3-4, 8-0-3, 4-5-6, 7-8-9-0"
- For confirmation say: "ending in X-X-X-X" (last 4 digits only)

CLINIC INFO:
- Location: Victoria Island, Lagos
- Hours: Monday to Thursday, 8am to 5pm. CLOSED Friday, Saturday, Sunday.
- Services: Cleaning, Whitening, Braces, Implants, Veneers, Fillings, Extractions, Checkup

TIME FORMAT:
- Morning: "8am", "9am", "10am", "11am"
- Afternoon: "12 noon", "1pm", "2pm", "3pm", "4pm"

BOOKING FLOW (be quick):
1. Get their name → Ask service needed
2. Ask preferred day → Offer time
3. Confirm with last 4 digits of phone
4. Done! Keep it under 2 minutes total.

WHEN SLOT UNAVAILABLE:
- "That's taken. How about [alternative]?"

TODAY: {{CURRENT_DATE}}
AVAILABLE DAYS: {{UPCOMING_DATES}}

TECHNICAL:
- Dates: YYYY-MM-DD format
- Times: HH:MM 24-hour format
- Closed: Friday, Saturday, Sunday
`;

export function getSystemPrompt(callerPhone?: string): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const phone = callerPhone || 'your number';
  
  return DENTAL_ASSISTANT_PROMPT
    .replace('{{CURRENT_DATE}}', today)
    .replace('{{UPCOMING_DATES}}', getUpcomingDates())
    .replaceAll('{{CALLER_PHONE}}', phone);
}
