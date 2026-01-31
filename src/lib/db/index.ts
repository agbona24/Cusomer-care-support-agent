import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Use Turso in production, local SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.TURSO_DATABASE_URL?.includes('turso.io');

const client = createClient({
  url: isProduction 
    ? (process.env.TURSO_DATABASE_URL || 'file:./dental-agent.db')
    : 'file:./dental-agent.db',
  authToken: isProduction ? process.env.TURSO_AUTH_TOKEN : undefined,
});

export const db = drizzle(client, { schema });
console.log(`📦 Database connected (${isProduction ? 'Turso' : 'Local SQLite'})`);
