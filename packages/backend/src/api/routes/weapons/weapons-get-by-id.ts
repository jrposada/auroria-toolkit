import type {
  WeaponsGetByIdParams,
  WeaponsGetByIdResponse,
} from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get-by-id';

import { getWeaponById } from '../../../services/weapon.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiWeapon } from '../../mappers/weapons.ts';

const handler = toRequestHandler<WeaponsGetByIdResponse, WeaponsGetByIdParams>(
  async (request) => {
    const { id } = request.params;

    const row = await getWeaponById(id);

    return {
      statusCode: 200,
      body: {
        success: true,
        data: {
          weapon: toApiWeapon(row),
        },
      },
    };
  }
);

export { handler };
