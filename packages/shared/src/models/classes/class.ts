import z from 'zod';

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const statSchema = z.number().int().nonnegative();
export const statBlockSchema = z.object({
  str: statSchema,
  agi: statSchema,
  con: statSchema,
  int: statSchema,
  tal: statSchema,
  end: statSchema,
});

export const classSchema = z.object({
  id: slugSchema,
  name: z.string(),
  baseStats: statBlockSchema,
  pointsPerLevel: z.number().int().positive(),
  maxLevel: z.number().int().positive(),
  weaponTypes: z.array(z.string()),
});
export type Class = z.infer<typeof classSchema>;
