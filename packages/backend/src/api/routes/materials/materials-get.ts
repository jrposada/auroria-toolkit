import type { MaterialsGetResponse } from '@jrposada/auroria-toolkit-shared/models/materials/materials-get';

import { getMaterials } from '../../../services/material.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiMaterial } from '../../mappers/materials.ts';

const handler = toRequestHandler<MaterialsGetResponse>(async () => {
  const materials = await getMaterials();

  return {
    statusCode: 200,
    body: {
      success: true,
      data: {
        materials: materials.map(toApiMaterial),
      },
    },
  };
});

export { handler };
