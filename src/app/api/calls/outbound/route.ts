import { NextRequest, NextResponse } from 'next/server';
import { makeOutboundCall } from '@/lib/twilio/calls';
import { z } from 'zod';

const outboundCallSchema = z.object({
  phoneNumber: z.string().min(10),
  message: z.string().optional(),
});

// API endpoint to initiate outbound calls
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message } = outboundCallSchema.parse(body);

    const callSid = await makeOutboundCall(phoneNumber, message);

    return NextResponse.json({
      success: true,
      callSid,
      message: `Outbound call initiated to ${phoneNumber}`,
    });
  } catch (error) {
    console.error('Error making outbound call:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to make outbound call' },
      { status: 500 }
    );
  }
}
