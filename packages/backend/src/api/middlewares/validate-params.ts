import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import ValidationError from '../../infrastructure/validation-error.ts';
import { handleApiError } from '../infrastructure/handle-api-error.ts';

export function validateParams<TSchema extends ZodSchema>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    // Answered here: in Express 4 a throw from a middleware never reaches
    // handleApiError, it ends in Express's own 500 page.
    if (!result.success) {
      handleApiError(new ValidationError('Invalid request parameters'), res);
      return;
    }

    req.params = result.data;
    next();
  };
}
