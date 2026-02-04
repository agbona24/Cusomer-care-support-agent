import twilio from 'twilio';
const { VoiceResponse } = twilio.twiml;

// Use APP_URL (runtime) or NEXT_PUBLIC_APP_URL (build-time) or fallback
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Voice configuration - Neural voice for human-like speech
const VOICE_CONFIG = {
  voice: 'Polly.Joanna-Neural' as const,  // Neural voice - much more human
  language: 'en-US' as const,
};

// Generate greeting TwiML for incoming calls
export function generateGreetingTwiml(): string {
  const response = new VoiceResponse();
  
  // Play greeting and gather speech input
  const gather = response.gather({
    input: ['speech'],
    action: `${APP_URL}/api/twilio/process`,
    method: 'POST',
    speechTimeout: 'auto',
    speechModel: 'experimental_conversations',
    enhanced: true,
    language: 'en-NG',
  });

  gather.say(VOICE_CONFIG, 'Hello and welcome to Smile Dental Clinic! My name is Sarah and I\'m here to help you. May I know your name please?');

  // If no input, prompt again
  response.redirect(`${APP_URL}/api/twilio/voice`);

  return response.toString();
}

// Generate response TwiML with AI-generated text
export function generateResponseTwiml(responseText: string, isComplete: boolean = false): string {
  const response = new VoiceResponse();

  if (isComplete) {
    // End the call after final message
    response.say(VOICE_CONFIG, responseText);
    response.say(VOICE_CONFIG, 'Thank you so much for calling Smile Dental Clinic! We really look forward to seeing you. Take care and have a lovely day. Bye bye!');
    response.hangup();
  } else {
    // Continue conversation
    const gather = response.gather({
      input: ['speech'],
      action: `${APP_URL}/api/twilio/process`,
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'experimental_conversations',
      enhanced: true,
      language: 'en-NG',
    });

    gather.say(VOICE_CONFIG, responseText);

    // If no input, ask if they're still there
    response.say(VOICE_CONFIG, "Hello? Are you still there?");
    response.redirect(`${APP_URL}/api/twilio/voice`);
  }

  return response.toString();
}

// Generate TwiML to place an outbound call
export function generateOutboundCallTwiml(message: string): string {
  const response = new VoiceResponse();

  const gather = response.gather({
    input: ['speech'],
    action: `${APP_URL}/api/twilio/process`,
    method: 'POST',
    speechTimeout: 'auto',
    speechModel: 'experimental_conversations',
    enhanced: true,
    language: 'en-NG',
  });

  gather.say(VOICE_CONFIG, message);

  return response.toString();
}
