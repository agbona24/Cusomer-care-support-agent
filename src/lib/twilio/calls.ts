import { twilioClient, twilioPhoneNumber } from './client';
import { generateOutboundCallTwiml } from './twiml';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Make an outbound call
export async function makeOutboundCall(
  toPhoneNumber: string,
  message?: string
): Promise<string> {
  const greeting = message || 
    "Hello, this is Sarah calling from Smile Dental Clinic. I'm calling to confirm your upcoming appointment. Is this a good time to talk?";

  const call = await twilioClient.calls.create({
    to: toPhoneNumber,
    from: twilioPhoneNumber!,
    twiml: generateOutboundCallTwiml(greeting),
    statusCallback: `${APP_URL}/api/twilio/status`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    statusCallbackMethod: 'POST',
  });

  return call.sid;
}

// Get call details
export async function getCallDetails(callSid: string) {
  return await twilioClient.calls(callSid).fetch();
}

// End an active call
export async function endCall(callSid: string) {
  return await twilioClient.calls(callSid).update({
    status: 'completed',
  });
}
