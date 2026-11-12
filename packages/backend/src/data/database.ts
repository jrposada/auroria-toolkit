import { assert } from '@jrposada/auroria-toolkit-shared/utils/assert';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import type { Lifecycle } from '../infrastructure/lifecycle.ts';
import Logger from '../infrastructure/logger.ts';

let database: NodePgDatabase | undefined;

export function getDatabase(): NodePgDatabase {
  assert(database, { msg: 'Database is not started' });

  return database;
}

export function createDatabase(): Lifecycle {
  let pool: pg.Pool | undefined;

  function onError(error: Error) {
    Logger.error('PostgreSQL connection error:', error);
  }

  async function start(): Promise<void> {
    assert(process.env.DATABASE_ENDPOINT, {
      msg: 'DATABASE_ENDPOINT is not set',
    });

    // The pool is created here, not at module load: dotenv runs after imports.
    pool = new pg.Pool({ connectionString: process.env.DATABASE_ENDPOINT });
    pool.on('error', onError);

    // A pool connects lazily; query once so an unreachable database fails startup.
    await pool.query('select 1');
    database = drizzle({ client: pool });
    Logger.info('✅ Connected to PostgreSQL');
  }

  async function stop(): Promise<void> {
    const current = pool;
    if (!current) {
      return;
    }

    pool = undefined;
    database = undefined;
    current.off('error', onError);
    await current.end();
    Logger.info('🔌 Disconnected from PostgreSQL');
  }

  return { start, stop };
}
