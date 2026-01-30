import { NextRequest, NextResponse } from 'next/server';
import { processConversation, Message } from '@/lib/openai/conversation';
import { generateResponseTwiml } from '@/lib/twilio/twiml';
import { db } from '@/lib/db';
import { callLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// In-memory conversation store (use Redis in production)
const conversationStore = new Map<string, Message[]>();

// Phrases that indicate the user wants to end the call
const END_CALL_PHRASES = [
  'goodbye', 'bye', 'thank you bye', 'thanks bye', 
  "that's all", "that is all", 'nothing else', 'no thanks',
  'have a good day', 'end call'
];

function shouldEndCall(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return END_CALL_PHRASES.some(phrase => lower.includes(phrase));
}

// Format messages into readable transcript
function formatTranscript(messages: Message[]): string {
  return messages.map(m => {
    const speaker = m.role === 'user' ? '👤 Caller' : '🤖 Sarah';
    return `${speaker}: ${m.content}`;
  }).join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') as string;

    console.log(`🎤 Speech from ${from}: "${speechResult}" (confidence: ${confidence})`);

    if (!speechResult) {
      // No speech detected, ask them to repeat
      const twiml = generateResponseTwiml(
        "I'm sorry, I didn't catch that. Could you please repeat?",
        false
      );
      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Get or create conversation history
    let messages = conversationStore.get(callSid) || [];
    
    // Add user message
    messages.push({ role: 'user', content: speechResult });

    // Process with AI
    const aiResponse = await processConversation(messages, from);

    // Add assistant response to history
    messages.push({ role: 'assistant', content: aiResponse });
    
    // Store updated conversation
    conversationStore.set(callSid, messages);

    // Save transcript to database (update on each turn)
    try {
      await db
        .update(callLogs)
        .set({ 
          transcript: formatTranscript(messages),
        })
        .where(eq(callLogs.callSid, callSid));
    } catch (e) {
      // Call log might not exist yet, that's ok
      console.log('Could not update transcript yet:', e);
    }

    // Check if call should end
    const isComplete = shouldEndCall(speechResult);

    // Generate TwiML response
    const twiml = generateResponseTwiml(aiResponse, isComplete);

    // Clean up conversation if call is ending
    if (isComplete) {
      // Keep for logging purposes, clean up after a delay
      setTimeout(() => {
        conversationStore.delete(callSid);
      }, 60000); // Clean up after 1 minute
    }

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Error processing speech:', error);
    
    const errorTwiml = generateResponseTwiml(
      "I'm sorry, I'm having trouble processing your request. Could you please repeat that?",
      false
    );
    
    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
