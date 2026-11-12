import type {
  WeaponsGetQuery,
  WeaponsGetResponse,
} from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get';

import { getWeapons } from '../../../services/weapon.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiWeapon } from '../../mappers/weapons.ts';

const handler = toRequestHandler<WeaponsGetResponse, unknown, WeaponsGetQuery>(
  async (request) => {
    const weapons = await getWeapons(request.query);

    return {
      statusCode: 200,
      body: {
        success: true,
        data: {
          weapons: weapons.map(toApiWeapon),
        },
      },
    };
  }
);

export { handler };
