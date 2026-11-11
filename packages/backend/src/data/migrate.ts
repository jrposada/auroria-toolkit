import path from 'node:path';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { getDatabase } from './database.ts';

// Same relative path from src/data (tsx) and dist/data (node).
const MIGRATIONS_FOLDER = path.resolve(import.meta.dirname, '../../drizzle');

export async function runMigrations(): Promise<void> {
  await migrate(getDatabase(), { migrationsFolder: MIGRATIONS_FOLDER });
}
