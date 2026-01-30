import { NextRequest, NextResponse } from 'next/server';
import { generateGreetingTwiml } from '@/lib/twilio/twiml';

// Handle incoming voice calls from Twilio
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    console.log(`📞 Incoming call: ${callSid} from ${from} to ${to}`);

    // Return greeting TwiML
    const twiml = generateGreetingTwiml();

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error handling voice webhook:', error);
    
    // Return a basic error response
    const errorTwiml = `
      <Response>
        <Say>We're experiencing technical difficulties. Please try again later.</Say>
        <Hangup/>
      </Response>
    `;
    
    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
