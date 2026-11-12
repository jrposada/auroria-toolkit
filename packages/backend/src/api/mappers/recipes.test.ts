import { recipeSchema } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import { describe, expect, it } from 'vitest';

import { RECIPES } from '../../data/seed/crafting-fixtures.ts';
import { toRecipeIngredientRows, toRecipeRow } from '../../data/seed/seed.ts';
import { toApiRecipe } from './recipes.ts';

describe('toApiRecipe', () => {
  it.each(RECIPES)('maps the $id rows back to the exact API recipe', (item) => {
    const api = toApiRecipe({
      recipe: toRecipeRow(item),
      ingredients: toRecipeIngredientRows(item),
    });

    expect(api).toEqual(item);
    // strict: `output` is nested and no row key (outputMaterialId, recipeId) leaks
    expect(recipeSchema.strict().parse(api)).toEqual(item);
    expect(Object.keys(api.ingredients[0] ?? {})).toEqual([
      'materialId',
      'quantity',
    ]);
  });
});
