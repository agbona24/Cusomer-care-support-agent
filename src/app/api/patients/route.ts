import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, appointments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all patients
    const allPatients = await db
      .select()
      .from(patients)
      .orderBy(desc(patients.createdAt));

    // Get appointment counts for each patient
    const patientsWithAppointments = await Promise.all(
      allPatients.map(async (patient) => {
        const patientAppointments = await db
          .select()
          .from(appointments)
          .where(eq(appointments.phoneNumber, patient.phoneNumber));
        
        const scheduled = patientAppointments.filter(a => a.status === 'scheduled').length;
        const completed = patientAppointments.filter(a => a.status === 'completed').length;
        const cancelled = patientAppointments.filter(a => a.status === 'cancelled').length;
        
        return {
          ...patient,
          appointmentStats: {
            total: patientAppointments.length,
            scheduled,
            completed,
            cancelled,
          },
          lastAppointment: patientAppointments.length > 0 
            ? patientAppointments.sort((a, b) => 
                b.appointmentDate.localeCompare(a.appointmentDate)
              )[0]
            : null,
        };
      })
    );

    return NextResponse.json({ patients: patientsWithAppointments });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
