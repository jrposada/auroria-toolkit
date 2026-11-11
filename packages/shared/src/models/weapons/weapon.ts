import z from 'zod';

import { slugSchema } from '../classes/class.ts';

export const raritySchema = z.enum([
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
]);
export type Rarity = z.infer<typeof raritySchema>;

export const temperingStepSchema = z.object({
  level: z.union([z.literal(1), z.literal(5), z.literal(10), z.literal(15)]),
  bonusPct: z.number(),
  stonesPerTry: z
    .object({
      count: z.number().int(),
      grade: z.enum(['Faint', 'Vivid', 'Brilliant']),
    })
    .nullable(),
  goldPerTry: z.number().int().nullable(),
});
export type TemperingStep = z.infer<typeof temperingStepSchema>;

export const weaponSchema = z.object({
  id: slugSchema,
  name: z.string(),
  class: slugSchema,
  type: z.string(),
  rarity: raritySchema,
  itemLevel: z.number().int(),
  talentRequirement: z.number().int().nullable(),
  weight: z.number(),
  physicalAtk: z.number().int().nullable(),
  magicAtk: z.number().int().nullable(),
  damageShare: z.object({ physical: z.number(), magic: z.number() }),
  staggerTrigger: z.number(),
  exhaustTrigger: z.number(),
  lunastone: z.string().nullable(),
  extraStat: z.string().nullable(),
  tempering: z.object({ steps: z.array(temperingStepSchema).length(4) }),
  howToGet: z.string(),
  notes: z.string().nullable(),
  sources: z
    .array(z.object({ url: z.string().url(), checked: z.string().date() }))
    .min(1),
});
export type Weapon = z.infer<typeof weaponSchema>;
