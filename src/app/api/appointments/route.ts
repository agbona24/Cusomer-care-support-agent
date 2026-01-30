import { NextRequest, NextResponse } from 'next/server';
import { getPatientAppointments, getAvailableSlots } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { z } from 'zod';

// GET /api/appointments?phone=+1234567890 - Get patient appointments
// GET /api/appointments?date=2026-02-01 - Get available slots
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get('phone');
  const date = searchParams.get('date');

  try {
    if (phone) {
      const patientAppointments = await getPatientAppointments(phone);
      return NextResponse.json({ appointments: patientAppointments });
    }

    if (date) {
      const slots = await getAvailableSlots(date);
      return NextResponse.json({ date, availableSlots: slots });
    }

    // Return all upcoming appointments (admin view)
    const today = new Date().toISOString().split('T')[0];
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        require('drizzle-orm').and(
          require('drizzle-orm').gte(appointments.appointmentDate, today),
          require('drizzle-orm').eq(appointments.status, 'scheduled')
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime)
      .all();

    return NextResponse.json({ appointments: allAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

const createAppointmentSchema = z.object({
  phoneNumber: z.string().min(10),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  serviceType: z.enum(['checkup', 'cleaning', 'filling', 'extraction', 'whitening', 'emergency', 'consultation']),
  patientName: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createAppointmentSchema.parse(body);

    // Check availability
    const available = await getAvailableSlots(data.appointmentDate);
    if (!available.includes(data.appointmentTime)) {
      return NextResponse.json(
        { error: `Time slot ${data.appointmentTime} is not available on ${data.appointmentDate}` },
        { status: 400 }
      );
    }

    const { bookAppointment, findOrCreatePatient } = await import('@/lib/db/queries');

    // Create or find patient
    if (data.patientName) {
      const nameParts = data.patientName.split(' ');
      await findOrCreatePatient(data.phoneNumber, {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
      });
    }

    const appointment = await bookAppointment({
      phoneNumber: data.phoneNumber,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      serviceType: data.serviceType,
      notes: data.notes,
    });

    return NextResponse.json({ 
      success: true, 
      appointment,
      message: `Appointment booked for ${data.appointmentDate} at ${data.appointmentTime}`
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
