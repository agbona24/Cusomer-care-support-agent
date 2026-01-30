import { createClient } from '@libsql/client';
import { drizzle as drizzleTurso } from 'drizzle-orm/libsql';
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Use Turso in production, local SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.TURSO_DATABASE_URL;

let db: ReturnType<typeof drizzleTurso> | ReturnType<typeof drizzleSqlite>;

if (isProduction && process.env.TURSO_DATABASE_URL) {
  // Production: Use Turso
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzleTurso(client, { schema });
  console.log('📦 Using Turso database');
} else {
  // Development: Use local SQLite
  const sqlite = new Database('dental-agent.db');
  db = drizzleSqlite(sqlite, { schema });
  console.log('📦 Using local SQLite database');
}

export { db };
