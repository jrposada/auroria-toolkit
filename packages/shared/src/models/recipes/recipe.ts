import z from 'zod';

import { slugSchema } from '../classes/class.ts';

const recipeItemSchema = z.object({
  materialId: slugSchema,
  quantity: z.number().int().positive(),
});

export const recipeSchema = z.object({
  id: slugSchema,
  output: recipeItemSchema,
  station: z.string(),
  profession: z.string(),
  professionLevel: z.number().int().nonnegative(),
  goldCost: z.number().int().nonnegative(),
  ingredients: z.array(recipeItemSchema),
});
export type Recipe = z.infer<typeof recipeSchema>;
