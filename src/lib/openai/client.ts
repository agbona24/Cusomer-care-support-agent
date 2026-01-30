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

// Shorter system prompt for faster responses
export const DENTAL_ASSISTANT_PROMPT = `You are Sarah, voice assistant for Smile Dental Clinic in Victoria Island, Lagos.

HOURS: Monday-Thursday 8AM-5PM. CLOSED Fri/Sat/Sun.
SERVICES: Scaling & Polishing, Teeth Whitening, Full-mouth Rehab, Orthodontics, Dental Implants, Veneers & Crowns, Periodontal, Paediatric Dentistry, Dental Surgery.
TIME SLOTS: 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30

TODAY: {{CURRENT_DATE}}
UPCOMING DATES: {{UPCOMING_DATES}}

RULES:
- Use YYYY-MM-DD format for dates (e.g., 2026-02-02)
- Use HH:MM 24-hour format for times (e.g., 14:00 for 2PM)
- Be brief (1-2 sentences max)
- If Friday/Sat/Sun requested, suggest Monday instead
`;

export function getSystemPrompt(): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return DENTAL_ASSISTANT_PROMPT
    .replace('{{CURRENT_DATE}}', today)
    .replace('{{UPCOMING_DATES}}', getUpcomingDates());
}
