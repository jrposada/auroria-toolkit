import type { Server } from 'node:http';

import cors from 'cors';
import express from 'express';

import type { Lifecycle } from '../infrastructure/lifecycle.ts';
import Logger from '../infrastructure/logger.ts';
import { traceId } from './middlewares/trace-id.ts';
import { router } from './routes/router.ts';

export function createServer(): Lifecycle {
  let server: Server | undefined;

  async function start(): Promise<void> {
    const app = express();

    app.use(
      cors(
        process.env.ALLOWED_ORIGIN
          ? { origin: process.env.ALLOWED_ORIGIN }
          : undefined
      )
    );
    app.use(traceId);
    app.use(express.json());

    app.use('/api', router);
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    const port = process.env.PORT || 4100;

    return await new Promise<void>((resolve, reject) => {
      server = app
        .listen(port, () => {
          Logger.info(`🚀 Server is running on http://localhost:${port}`);
          resolve();
        })
        .on('error', reject);
    });
  }

  function stop(): Promise<void> {
    const current = server;
    if (!current) {
      return Promise.resolve();
    }

    server = undefined;
    return new Promise<void>((resolve, reject) => {
      current.close((error) => (error ? reject(error) : resolve()));
    });
  }

  return { start, stop };
}
