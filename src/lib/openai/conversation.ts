import OpenAI from 'openai';
import { openai, getSystemPrompt } from './client';
import {
  getAvailableSlots,
  bookAppointment,
  getPatientAppointments,
  rescheduleAppointment,
  cancelAppointment,
  findOrCreatePatient,
} from '../db/queries';

// Define the tools/functions the AI can use
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check available appointment slots for a specific date',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'The date to check in YYYY-MM-DD format',
          },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book a new appointment for the patient',
      parameters: {
        type: 'object',
        properties: {
          patient_name: {
            type: 'string',
            description: 'Full name of the patient',
          },
          phone_number: {
            type: 'string',
            description: 'Patient phone number',
          },
          date: {
            type: 'string',
            description: 'Appointment date in YYYY-MM-DD format',
          },
          time: {
            type: 'string',
            description: 'Appointment time in HH:MM format (24-hour)',
          },
          service_type: {
            type: 'string',
            description: 'Type of dental service needed',
            enum: ['scaling-polishing', 'teeth-whitening', 'full-mouth-rehab', 'orthodontics', 'dental-implants', 'veneers-crowns', 'periodontal', 'paediatric', 'dental-surgery', 'consultation'],
          },
        },
        required: ['phone_number', 'date', 'time', 'service_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patient_appointments',
      description: 'Get upcoming appointments for a patient by phone number',
      parameters: {
        type: 'object',
        properties: {
          phone_number: {
            type: 'string',
            description: 'Patient phone number',
          },
        },
        required: ['phone_number'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_appointment',
      description: 'Reschedule an existing appointment to a new date/time',
      parameters: {
        type: 'object',
        properties: {
          appointment_id: {
            type: 'number',
            description: 'ID of the appointment to reschedule',
          },
          new_date: {
            type: 'string',
            description: 'New appointment date in YYYY-MM-DD format',
          },
          new_time: {
            type: 'string',
            description: 'New appointment time in HH:MM format',
          },
        },
        required: ['appointment_id', 'new_date', 'new_time'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_appointment',
      description: 'Cancel an existing appointment',
      parameters: {
        type: 'object',
        properties: {
          appointment_id: {
            type: 'number',
            description: 'ID of the appointment to cancel',
          },
        },
        required: ['appointment_id'],
      },
    },
  },
];

// Handle function calls from the AI
async function handleFunctionCall(
  name: string,
  args: Record<string, unknown>,
  callerPhoneNumber: string
): Promise<string> {
  console.log(`📋 Function call: ${name}`, JSON.stringify(args));
  
  try {
    switch (name) {
      case 'check_availability': {
        const dateStr = args.date as string;
        console.log(`📅 Checking availability for: ${dateStr}`);
        const slots = await getAvailableSlots(dateStr);
        if (slots.length === 0) {
          // Check if it's a weekend
          const day = new Date(dateStr).getDay();
          if (day === 0 || day === 5 || day === 6) {
            return `Sorry, we're closed on ${dateStr} (weekends). We're open Monday through Thursday.`;
          }
          return `No available slots on ${dateStr}. All times are booked.`;
        }
        return `Available times on ${dateStr}: ${slots.join(', ')}`;
      }

      case 'book_appointment': {
        const phoneNumber = (args.phone_number as string) || callerPhoneNumber;
        console.log(`📝 Booking: ${args.date} at ${args.time} for ${args.service_type}`);
        
        // Find or create patient
        const nameParts = ((args.patient_name as string) || '').split(' ');
        await findOrCreatePatient(phoneNumber, {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
        });

        const appointment = await bookAppointment({
          phoneNumber,
          appointmentDate: args.date as string,
          appointmentTime: args.time as string,
          serviceType: args.service_type as string,
        });

        return `Appointment booked successfully! Confirmation #${appointment.id} for ${args.service_type} on ${args.date} at ${args.time}.`;
      }

      case 'get_patient_appointments': {
        const phoneNumber = (args.phone_number as string) || callerPhoneNumber;
        const appts = await getPatientAppointments(phoneNumber);
        
        if (appts.length === 0) {
          return 'No upcoming appointments found for this phone number.';
        }

        const formatted = appts.map(a => 
          `ID #${a.id}: ${a.serviceType} on ${a.appointmentDate} at ${a.appointmentTime}`
        ).join('; ');
        
        return `Found ${appts.length} upcoming appointment(s): ${formatted}`;
      }

      case 'reschedule_appointment': {
        const updated = await rescheduleAppointment(
          args.appointment_id as number,
          args.new_date as string,
          args.new_time as string
        );
        return `Appointment #${updated.id} rescheduled to ${args.new_date} at ${args.new_time}.`;
      }

      case 'cancel_appointment': {
        await cancelAppointment(args.appointment_id as number);
        return `Appointment #${args.appointment_id} has been cancelled.`;
      }

      default:
        return `Unknown function: ${name}`;
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Timeout wrapper for API calls
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

// Process a conversation turn
export async function processConversation(
  messages: Message[],
  callerPhoneNumber: string
): Promise<string> {
  const startTime = Date.now();
  console.log('🧠 Starting AI processing...');
  
  try {
    return await withTimeout(
      processConversationInternal(messages, callerPhoneNumber, startTime),
      12000 // 12 second timeout
    );
  } catch (error) {
    console.error('❌ AI processing error:', error);
    return "I'm sorry, I'm having a brief connection issue. What service are you interested in?";
  }
}

// Internal processing function
async function processConversationInternal(
  messages: Message[],
  callerPhoneNumber: string,
  startTime: number
): Promise<string> {
  // Add system prompt if not present
  const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: getSystemPrompt() },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // Call OpenAI - using gpt-4o-mini for faster responses
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: conversationMessages,
    tools,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 300,
  });
  
  console.log(`⏱️ First OpenAI call: ${Date.now() - startTime}ms`);

  const assistantMessage = response.choices[0].message;

  // If no tool calls, return the text response
  if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
    console.log(`⏱️ Total AI processing (no tools): ${Date.now() - startTime}ms`);
    return assistantMessage.content || "I'm sorry, I didn't catch that. How can I help you?";
  }

  // Handle tool calls
  console.log(`🔧 Tool calls: ${assistantMessage.tool_calls.map(t => t.function.name).join(', ')}`);
  const toolResults: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  
  for (const toolCall of assistantMessage.tool_calls) {
    const args = JSON.parse(toolCall.function.arguments);
    const result = await handleFunctionCall(
      toolCall.function.name,
      args,
      callerPhoneNumber
    );

    toolResults.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: result,
    });
  }

  // Get final response after tool execution
  const finalResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...conversationMessages,
      assistantMessage,
      ...toolResults,
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  console.log(`⏱️ Total AI processing: ${Date.now() - startTime}ms`);
  return finalResponse.choices[0].message.content || "Is there anything else I can help you with?";
}