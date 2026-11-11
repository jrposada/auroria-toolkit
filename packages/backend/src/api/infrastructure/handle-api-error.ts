import { ApiErrorCode } from '@jrposada/auroria-toolkit-shared/models/api-error-code';
import type { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import type { Response } from 'express';

import Logger from '../../infrastructure/logger.ts';
import ResourceNotFound from '../../infrastructure/not-found-error.ts';
import ValidationError from '../../infrastructure/validation-error.ts';

export function handleApiError<TError = unknown>(error: TError, res: Response) {
  Logger.error('API Error:', error);

  let status = 500;
  const body: ApiResponse<unknown> = {
    data: undefined,
    success: false,
  };

  if (error instanceof ResourceNotFound) {
    status = 404;
    body.data = { code: ApiErrorCode.NotFound };
  } else if (error instanceof ValidationError) {
    status = 400;
    body.data = { code: ApiErrorCode.ValidationFailed };
  }

  res.status(status).json(body);
}
