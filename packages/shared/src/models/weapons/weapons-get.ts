import z from 'zod';

import { slugSchema } from '../classes/class.ts';
import { Weapon } from './weapon.ts';

export const weaponsGetQuerySchema = z.object({
  class: slugSchema.optional(),
  type: z.string().optional(),
});
export type WeaponsGetQuery = z.infer<typeof weaponsGetQuerySchema>;

export type WeaponsGetResponse = {
  weapons: Weapon[];
};
