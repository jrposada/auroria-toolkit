import { Router } from 'express';

import { registerClassesRoutes } from './classes/classes-routes.ts';
import { registerWeaponsRoutes } from './weapons/weapons-routes.ts';

export const router = Router();

registerClassesRoutes(router);
registerWeaponsRoutes(router);
