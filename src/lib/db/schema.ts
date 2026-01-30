import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Patients table
export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Appointments table
export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').references(() => patients.id),
  phoneNumber: text('phone_number').notNull(),
  appointmentDate: text('appointment_date').notNull(), // ISO date string
  appointmentTime: text('appointment_time').notNull(), // HH:MM format
  duration: integer('duration').default(30), // minutes
  serviceType: text('service_type').notNull(), // cleaning, checkup, extraction, etc.
  status: text('status').default('scheduled'), // scheduled, confirmed, cancelled, completed
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Call logs table
export const callLogs = sqliteTable('call_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  callSid: text('call_sid').unique(),
  phoneNumber: text('phone_number').notNull(),
  direction: text('direction').notNull(), // inbound or outbound
  status: text('status').notNull(),
  duration: integer('duration'),
  transcript: text('transcript'),
  summary: text('summary'),
  actionsTaken: text('actions_taken'), // JSON string of actions
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Types
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type CallLog = typeof callLogs.$inferSelect;
export type NewCallLog = typeof callLogs.$inferInsert;
