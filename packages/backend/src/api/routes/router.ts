import { Router } from 'express';

import { registerClassesRoutes } from './classes/classes-routes.ts';
import { registerMaterialsRoutes } from './materials/materials-routes.ts';
import { registerWeaponsRoutes } from './weapons/weapons-routes.ts';

export const router = Router();

registerClassesRoutes(router);
registerWeaponsRoutes(router);
registerMaterialsRoutes(router);
