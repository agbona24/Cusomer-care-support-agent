import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, rescheduleAppointment, cancelAppointment } from '@/lib/db/queries';
import { z } from 'zod';

interface RouteParams {
  params: { id: string };
}

// GET /api/appointments/[id] - Get single appointment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

const rescheduleSchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// PATCH /api/appointments/[id] - Reschedule appointment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { newDate, newTime } = rescheduleSchema.parse(body);

    const updated = await rescheduleAppointment(id, newDate, newTime);

    return NextResponse.json({
      success: true,
      appointment: updated,
      message: `Appointment rescheduled to ${newDate} at ${newTime}`,
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('not available')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to reschedule appointment' }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    await cancelAppointment(id);

    return NextResponse.json({
      success: true,
      message: `Appointment #${id} cancelled`,
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}
