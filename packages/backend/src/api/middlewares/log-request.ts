import type { NextFunction, Request, Response } from 'express';

import Logger from '../../infrastructure/logger.ts';

export async function logRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  Logger.info(`[${req.method}] ${req.path}`, {
    payload: req.body ? JSON.stringify(req.body) : null,
  });
  next();
}
