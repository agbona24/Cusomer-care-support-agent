import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Handle call status updates from Twilio
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const direction = formData.get('Direction') as string;
    const duration = formData.get('CallDuration') as string;

    console.log(`📊 Call status update: ${callSid} - ${callStatus}`);

    // Log call events
    if (callStatus === 'initiated' || callStatus === 'ringing') {
      // Call started - create log entry
      await db.insert(callLogs).values({
        callSid,
        phoneNumber: direction === 'inbound' ? from : to,
        direction: direction === 'inbound' ? 'inbound' : 'outbound',
        status: callStatus,
      }).onConflictDoNothing();
    } else if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer') {
      // Call ended - update log entry
      await db
        .update(callLogs)
        .set({
          status: callStatus,
          duration: duration ? parseInt(duration) : null,
        })
        .where(eq(callLogs.callSid, callSid));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling status callback:', error);
    return NextResponse.json({ error: 'Failed to process status' }, { status: 500 });
  }
}
