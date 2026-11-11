import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';

import type { ClassRow } from '../../data/models/class.ts';

function toApiClass(model: ClassRow): Class {
  return {
    id: model.id,
    name: model.name,
    baseStats: model.baseStats,
    pointsPerLevel: model.pointsPerLevel,
    maxLevel: model.maxLevel,
    weaponTypes: model.weaponTypes,
  };
}

export { toApiClass };
