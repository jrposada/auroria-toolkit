import type { NextFunction, Request, Response } from 'express';

import { RequestContext } from '../../services/request-context.ts';

const TRACE_ID_HEADER = 'x-trace-id';

export function traceId(req: Request, res: Response, next: NextFunction): void {
  const id = req.header(TRACE_ID_HEADER) || crypto.randomUUID();

  res.setHeader(TRACE_ID_HEADER, id);

  RequestContext.run({ traceId: id }, next);
}
