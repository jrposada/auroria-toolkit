import z from 'zod';

import { Weapon } from './weapon.ts';

export const weaponsGetByIdParamsSchema = z.object({
  id: z.string().nonempty(),
});
export type WeaponsGetByIdParams = z.infer<typeof weaponsGetByIdParamsSchema>;

export type WeaponsGetByIdResponse = {
  weapon: Weapon;
};
