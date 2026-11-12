import z from 'zod';

import { Recipe } from './recipe.ts';

export const recipesGetByIdParamsSchema = z.object({
  id: z.string().nonempty(),
});
export type RecipesGetByIdParams = z.infer<typeof recipesGetByIdParamsSchema>;

export type RecipesGetByIdResponse = {
  recipe: Recipe;
};
