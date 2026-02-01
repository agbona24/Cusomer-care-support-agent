import twilio from 'twilio';
const { VoiceResponse } = twilio.twiml;

// Use APP_URL (runtime) or NEXT_PUBLIC_APP_URL (build-time) or fallback
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Generate greeting TwiML for incoming calls
export function generateGreetingTwiml(): string {
  const response = new VoiceResponse();
  
  // Play greeting and gather speech input with BARGE-IN enabled
  const gather = response.gather({
    input: ['speech'],
    action: `${APP_URL}/api/twilio/process`,
    method: 'POST',
    speechTimeout: 'auto',
    speechModel: 'experimental_conversations',
    enhanced: true,
    language: 'en-NG',
    bargeIn: true,  // Allow caller to interrupt immediately
    actionOnEmptyResult: true,  // Process even on silence (faster loop)
  });

  gather.say(
    {
      voice: 'Polly.Amy',
      language: 'en-GB',
    },
    'Smile Dental Clinic, this is Sarah. How can I help you today?'
  );

  // If no input, prompt again
  response.redirect(`${APP_URL}/api/twilio/voice`);

  return response.toString();
}

// Generate response TwiML with AI-generated text
export function generateResponseTwiml(responseText: string, isComplete: boolean = false): string {
  const response = new VoiceResponse();

  if (isComplete) {
    // End the call after final message
    response.say(
      {
        voice: 'Polly.Amy',
        language: 'en-GB',
      },
      responseText
    );
    response.say(
      {
        voice: 'Polly.Amy',
        language: 'en-GB',
      },
      'Thanks for calling! See you soon, bye!'
    );
    response.hangup();
  } else {
    // Continue conversation with BARGE-IN enabled
    const gather = response.gather({
      input: ['speech'],
      action: `${APP_URL}/api/twilio/process`,
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'experimental_conversations',
      enhanced: true,
      language: 'en-NG',
      bargeIn: true,  // Allow caller to interrupt immediately
      actionOnEmptyResult: true,  // Process even on silence
    });

    gather.say(
      {
        voice: 'Polly.Amy',
        language: 'en-GB',
      },
      responseText
    );

    // If no input, short prompt
    response.say(
      {
        voice: 'Polly.Amy',
        language: 'en-GB',
      },
      "Are you there?"
    );
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
    bargeIn: true,  // Allow interrupt
    actionOnEmptyResult: true,
  });

  gather.say(
    {
      voice: 'Polly.Amy',
      language: 'en-GB',
    },
    message
  );

  return response.toString();
}
