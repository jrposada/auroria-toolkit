import type { Router } from 'express';

import { logRequest } from '../../middlewares/log-request.ts';
import { logResponse } from '../../middlewares/log-response.ts';
import { handler as materialsGet } from './materials-get.ts';

export function registerMaterialsRoutes(router: Router): void {
  router.get('/materials', logRequest, logResponse, materialsGet);
}
