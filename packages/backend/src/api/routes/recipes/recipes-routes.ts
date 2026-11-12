import { recipesGetByIdParamsSchema } from '@jrposada/auroria-toolkit-shared/models/recipes/recipes-get-by-id';
import type { Router } from 'express';

import { logRequest } from '../../middlewares/log-request.ts';
import { logResponse } from '../../middlewares/log-response.ts';
import { validateParams } from '../../middlewares/validate-params.ts';
import { handler as recipesGet } from './recipes-get.ts';
import { handler as recipesGetById } from './recipes-get-by-id.ts';

export function registerRecipesRoutes(router: Router): void {
  router.get('/recipes', logRequest, logResponse, recipesGet);
  router.get(
    '/recipes/:id',
    logRequest,
    logResponse,
    validateParams(recipesGetByIdParamsSchema),
    recipesGetById
  );
}
