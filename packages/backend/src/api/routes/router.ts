import { Router } from 'express';

import { registerClassesRoutes } from './classes/classes-routes.ts';

export const router = Router();

registerClassesRoutes(router);
