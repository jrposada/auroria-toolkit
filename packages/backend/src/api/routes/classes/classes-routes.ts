import { classesGetByIdParamsSchema } from '@jrposada/auroria-toolkit-shared/models/classes/classes-get-by-id';
import type { Router } from 'express';

import { logRequest } from '../../middlewares/log-request.ts';
import { logResponse } from '../../middlewares/log-response.ts';
import { validateParams } from '../../middlewares/validate-params.ts';
import { handler as classesGet } from './classes-get.ts';
import { handler as classesGetById } from './classes-get-by-id.ts';

export function registerClassesRoutes(router: Router): void {
  router.get('/classes', logRequest, logResponse, classesGet);
  router.get(
    '/classes/:id',
    logRequest,
    logResponse,
    validateParams(classesGetByIdParamsSchema),
    classesGetById
  );
}
