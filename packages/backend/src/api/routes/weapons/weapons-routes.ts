import { weaponsGetQuerySchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get';
import { weaponsGetByIdParamsSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get-by-id';
import type { Router } from 'express';

import { logRequest } from '../../middlewares/log-request.ts';
import { logResponse } from '../../middlewares/log-response.ts';
import { validateParams } from '../../middlewares/validate-params.ts';
import { validateQuery } from '../../middlewares/validate-query.ts';
import { handler as weaponsGet } from './weapons-get.ts';
import { handler as weaponsGetById } from './weapons-get-by-id.ts';

export function registerWeaponsRoutes(router: Router): void {
  router.get(
    '/weapons',
    logRequest,
    logResponse,
    validateQuery(weaponsGetQuerySchema),
    weaponsGet
  );
  router.get(
    '/weapons/:id',
    logRequest,
    logResponse,
    validateParams(weaponsGetByIdParamsSchema),
    weaponsGetById
  );
}
