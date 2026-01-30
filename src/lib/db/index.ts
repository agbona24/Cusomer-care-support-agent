import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Always use Turso/libsql (works both locally and in production)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./dental-agent.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
console.log('📦 Database connected');
