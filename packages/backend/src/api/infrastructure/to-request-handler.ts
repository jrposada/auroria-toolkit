import type { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import type { Request, Response } from 'express';

import { handleApiError } from './handle-api-error.ts';

export type ApiResponseResult<TData = unknown> = {
  statusCode: number;
  body: ApiResponse<TData>;
  headers?: Record<string, string>;
};

export function toRequestHandler<
  TData,
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
>(
  handler: (
    req: Request<TParams, unknown, TBody, TQuery>
  ) => Promise<ApiResponseResult<TData>>
) {
  return async (req: Request, res: Response) => {
    try {
      const { statusCode, body, headers } = await handler(
        req as Request<TParams, unknown, TBody, TQuery>
      );

      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      res.status(statusCode).json(body);
    } catch (error) {
      handleApiError(error, res);
    }
  };
}
