import dotenv from 'dotenv';

import { createDatabase } from './data/database.ts';
import { runMigrations } from './data/migrate.ts';
import { parseSeed, seedDatabase } from './data/seed/seed.ts';
import type { Lifecycle } from './infrastructure/lifecycle.ts';
import Logger from './infrastructure/logger.ts';

dotenv.config();

let database: Lifecycle | undefined;

async function main() {
  // Parsed first so an invalid seed file stops startup before anything is written.
  const seed = parseSeed();

  database = createDatabase();
  await database.start();

  await runMigrations();
  await seedDatabase(seed);
}

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  try {
    await database?.stop();
    process.exit(0);
  } catch (error) {
    Logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((error) => {
  Logger.error('Error in main execution:', error);
  process.exit(1);
});
