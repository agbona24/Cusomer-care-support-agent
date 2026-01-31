import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients, callLogs } from '@/lib/db/schema';
import { eq, gte, and, sql, desc, lte } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get today's appointments
    const todaysAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, today),
          eq(appointments.status, 'scheduled')
        )
      )
      .orderBy(appointments.appointmentTime);

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const upcomingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, today),
          lte(appointments.appointmentDate, nextWeek),
          eq(appointments.status, 'scheduled')
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);

    // Get recent calls
    const recentCalls = await db
      .select()
      .from(callLogs)
      .orderBy(desc(callLogs.createdAt))
      .limit(5);

    // Get total patients
    const allPatients = await db.select().from(patients);
    const totalPatients = allPatients.length;

    // Get total appointments
    const allAppointments = await db.select().from(appointments);
    const totalAppointments = allAppointments.length;
    const scheduledAppointments = allAppointments.filter(a => a.status === 'scheduled').length;
    const completedAppointments = allAppointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = allAppointments.filter(a => a.status === 'cancelled').length;

    // Get this week's appointments count
    const thisWeekAppointments = allAppointments.filter(a => 
      a.appointmentDate >= weekAgo && a.appointmentDate <= today
    ).length;

    // Get total calls
    const allCalls = await db.select().from(callLogs);
    const totalCalls = allCalls.length;
    const inboundCalls = allCalls.filter(c => c.direction === 'inbound').length;
    const outboundCalls = allCalls.filter(c => c.direction === 'outbound').length;

    // Get appointments by service type
    const serviceBreakdown = allAppointments.reduce((acc, apt) => {
      acc[apt.serviceType] = (acc[apt.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get appointments by day for calendar (next 30 days)
    const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const calendarAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, today),
          lte(appointments.appointmentDate, thirtyDaysOut),
          eq(appointments.status, 'scheduled')
        )
      );

    // Group by date for calendar view
    const appointmentsByDate = calendarAppointments.reduce((acc, apt) => {
      if (!acc[apt.appointmentDate]) {
        acc[apt.appointmentDate] = [];
      }
      acc[apt.appointmentDate].push(apt);
      return acc;
    }, {} as Record<string, typeof calendarAppointments>);

    return NextResponse.json({
      stats: {
        totalPatients,
        totalAppointments,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
        thisWeekAppointments,
        totalCalls,
        inboundCalls,
        outboundCalls,
        todaysCount: todaysAppointments.length,
      },
      todaysAppointments,
      upcomingAppointments,
      recentCalls,
      serviceBreakdown,
      appointmentsByDate,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
