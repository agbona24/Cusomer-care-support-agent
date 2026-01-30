import twilio from 'twilio';
const { VoiceResponse } = twilio.twiml;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Generate greeting TwiML for incoming calls
export function generateGreetingTwiml(): string {
  const response = new VoiceResponse();
  
  // Play greeting and gather speech input
  const gather = response.gather({
    input: ['speech'],
    action: `${APP_URL}/api/twilio/process`,
    method: 'POST',
    speechTimeout: '2',  // Respond 2 seconds after user stops talking
    speechModel: 'phone_call',
    enhanced: true,
    language: 'en-US',
  });

  gather.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    'Thank you for calling Smile Dental Clinic. My name is Sarah, how can I help you today?'
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
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      responseText
    );
    response.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      'Thank you for calling Smile Dental Clinic. Have a great day! Goodbye.'
    );
    response.hangup();
  } else {
    // Continue conversation
    const gather = response.gather({
      input: ['speech'],
      action: `${APP_URL}/api/twilio/process`,
      method: 'POST',
      speechTimeout: '2',  // Respond 2 seconds after user stops talking
      speechModel: 'phone_call',
      enhanced: true,
      language: 'en-US',
    });

    gather.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      responseText
    );

    // If no input, ask if they're still there
    response.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      "I'm sorry, I didn't hear anything. Are you still there?"
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
    speechModel: 'phone_call',
    enhanced: true,
    language: 'en-US',
  });

  gather.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    message
  );

  return response.toString();
}
