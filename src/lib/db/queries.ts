import { db } from './index';
import { appointments, patients } from './schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { NewAppointment, NewPatient } from './schema';

// ============ PATIENT OPERATIONS ============

export async function findOrCreatePatient(phoneNumber: string, data?: Partial<NewPatient>) {
  // Try to find existing patient
  const existing = await db
    .select()
    .from(patients)
    .where(eq(patients.phoneNumber, phoneNumber))
    .get();

  if (existing) {
    return existing;
  }

  // Create new patient
  const result = await db
    .insert(patients)
    .values({
      phoneNumber,
      ...data,
    })
    .returning()
    .get();

  return result;
}

export async function updatePatient(phoneNumber: string, data: Partial<NewPatient>) {
  return await db
    .update(patients)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(patients.phoneNumber, phoneNumber))
    .returning()
    .get();
}

// ============ APPOINTMENT OPERATIONS ============

export async function getAvailableSlots(date: string): Promise<string[]> {
  // Check if date falls on Friday, Saturday, or Sunday (clinic closed)
  const parsedDate = new Date(date + 'T12:00:00'); // Add time to avoid timezone issues
  const dayOfWeek = parsedDate.getDay();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
  console.log(`📆 Date ${date} is a ${dayName} (day ${dayOfWeek})`);
  
  if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
    // Sunday = 0, Friday = 5, Saturday = 6
    console.log(`❌ Clinic closed on ${dayName}`);
    return []; // Clinic closed
  }

  // Clinic hours: 8 AM to 5 PM, 30-minute slots (Mon-Thu only)
  const allSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ];

  // Get booked appointments for the date
  const bookedAppointments = await db
    .select({ time: appointments.appointmentTime })
    .from(appointments)
    .where(
      and(
        eq(appointments.appointmentDate, date),
        eq(appointments.status, 'scheduled')
      )
    )
    .all();

  const bookedTimes = new Set(bookedAppointments.map(a => a.time));
  
  return allSlots.filter(slot => !bookedTimes.has(slot));
}

export async function bookAppointment(data: NewAppointment) {
  // Check if slot is available
  const available = await getAvailableSlots(data.appointmentDate);
  
  if (!available.includes(data.appointmentTime)) {
    throw new Error(`The ${data.appointmentTime} slot on ${data.appointmentDate} is not available`);
  }

  const result = await db
    .insert(appointments)
    .values(data)
    .returning()
    .get();

  return result;
}

export async function getPatientAppointments(phoneNumber: string) {
  const today = new Date().toISOString().split('T')[0];
  
  return await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.phoneNumber, phoneNumber),
        gte(appointments.appointmentDate, today),
        eq(appointments.status, 'scheduled')
      )
    )
    .orderBy(appointments.appointmentDate, appointments.appointmentTime)
    .all();
}

export async function rescheduleAppointment(
  appointmentId: number,
  newDate: string,
  newTime: string
) {
  // Check if new slot is available
  const available = await getAvailableSlots(newDate);
  
  if (!available.includes(newTime)) {
    throw new Error(`The ${newTime} slot on ${newDate} is not available`);
  }

  return await db
    .update(appointments)
    .set({
      appointmentDate: newDate,
      appointmentTime: newTime,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(appointments.id, appointmentId))
    .returning()
    .get();
}

export async function cancelAppointment(appointmentId: number) {
  return await db
    .update(appointments)
    .set({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(appointments.id, appointmentId))
    .returning()
    .get();
}

export async function getAppointmentById(appointmentId: number) {
  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .get();
}
