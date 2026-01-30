import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callLogs } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/calls - Get all call logs
export async function GET() {
  try {
    const calls = await db
      .select()
      .from(callLogs)
      .orderBy(desc(callLogs.createdAt))
      .limit(100)
      .all();

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json({ error: 'Failed to fetch call logs' }, { status: 500 });
  }
}
