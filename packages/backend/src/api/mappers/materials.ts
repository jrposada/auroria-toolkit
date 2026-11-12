import type { Material } from '@jrposada/auroria-toolkit-shared/models/materials/material';

import type { MaterialRow } from '../../data/models/material.ts';

function toApiMaterial(model: MaterialRow): Material {
  return {
    id: model.id,
    name: model.name,
  };
}

export { toApiMaterial };
