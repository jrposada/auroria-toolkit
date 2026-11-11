import type { NextFunction, Request, Response } from 'express';

import Logger from '../../infrastructure/logger.ts';

export async function logResponse(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const originalJson = res.json.bind(res);
  let responseBody: unknown;

  res.json = (body: unknown) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    Logger.info(`[${req.method}] ${req.path} -> ${res.statusCode}`, {
      payload: responseBody ? JSON.stringify(responseBody) : null,
    });
  });

  next();
}
