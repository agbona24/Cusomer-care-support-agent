import { twilioClient } from './client';

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER!;
const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:${TWILIO_PHONE}`;
const CLINIC_NAME = 'Smile Dental Clinic';

interface AppointmentDetails {
  patientName: string;
  phoneNumber: string;
  date: string;
  time: string;
  serviceType: string;
  confirmationId: number;
}

// Format time in Nigerian-friendly way
function formatTimeNigerian(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
  const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const minuteStr = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
  return `${hour12}${minuteStr}${period === 'morning' ? 'am' : 'pm'} in the ${period}`;
}

// Format date in friendly way
function formatDateNigerian(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Format service type nicely
function formatService(service: string): string {
  return service
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Create appointment confirmation message
function createConfirmationMessage(details: AppointmentDetails): string {
  const formattedDate = formatDateNigerian(details.date);
  const formattedTime = formatTimeNigerian(details.time);
  const formattedService = formatService(details.serviceType);
  
  return `✅ *Appointment Confirmed!*

Hello ${details.patientName}! 👋

Your appointment at ${CLINIC_NAME} has been booked:

📅 *Date:* ${formattedDate}
🕐 *Time:* ${formattedTime}
🦷 *Service:* ${formattedService}
🔢 *Confirmation #:* ${details.confirmationId}

📍 *Location:* Victoria Island, Lagos

Please arrive 10 minutes early. If you need to reschedule, call us back or reply to this message.

See you soon! 😊

— Sarah, ${CLINIC_NAME}`;
}

// Create reminder message (for 24 hours before)
function createReminderMessage(details: AppointmentDetails): string {
  const formattedTime = formatTimeNigerian(details.time);
  const formattedService = formatService(details.serviceType);
  
  return `⏰ *Appointment Reminder*

Hello ${details.patientName}!

This is a friendly reminder that you have an appointment *tomorrow* at ${CLINIC_NAME}:

🕐 *Time:* ${formattedTime}
🦷 *Service:* ${formattedService}

📍 Victoria Island, Lagos

Reply YES to confirm or call us to reschedule.

See you soon! 😊`;
}

// Send via SMS
export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    // Format Nigerian number
    const formattedNumber = formatNigerianNumber(to);
    
    await twilioClient.messages.create({
      body: message.replace(/\*/g, ''), // Remove markdown for SMS
      from: TWILIO_PHONE,
      to: formattedNumber,
    });
    
    console.log(`📱 SMS sent to ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error('❌ SMS failed:', error);
    return false;
  }
}

// Send via WhatsApp
export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  try {
    const formattedNumber = formatNigerianNumber(to);
    
    await twilioClient.messages.create({
      body: message,
      from: WHATSAPP_NUMBER,
      to: `whatsapp:${formattedNumber}`,
    });
    
    console.log(`💬 WhatsApp sent to ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error('❌ WhatsApp failed:', error);
    return false;
  }
}

// Format Nigerian phone number to E.164
function formatNigerianNumber(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  
  // Handle Nigerian numbers
  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  } else if (!digits.startsWith('234')) {
    digits = '234' + digits;
  }
  
  return '+' + digits;
}

// Send appointment confirmation via SMS (WhatsApp requires business setup)
export async function sendAppointmentConfirmation(details: AppointmentDetails): Promise<void> {
  const message = createConfirmationMessage(details);
  
  // Use SMS - works immediately for Nigerian numbers
  await sendSMS(details.phoneNumber, message);
}

// Send appointment reminder
export async function sendAppointmentReminder(details: AppointmentDetails): Promise<void> {
  const message = createReminderMessage(details);
  
  const whatsappSent = await sendWhatsApp(details.phoneNumber, message);
  
  if (!whatsappSent) {
    await sendSMS(details.phoneNumber, message);
  }
}
