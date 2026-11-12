import { describe, expect, it } from 'vitest';

import { RECIPES } from '../data/seed/crafting-fixtures.ts';
import { toRecipeIngredientRows, toRecipeRow } from '../data/seed/seed.ts';
import { withIngredients } from './recipe.ts';

describe('withIngredients', () => {
  const rows = RECIPES.map(toRecipeRow);
  const all = RECIPES.flatMap(toRecipeIngredientRows);

  it('pairs every recipe with its own ingredient rows, keeping both orders', () => {
    expect(withIngredients(rows, all)).toEqual(
      RECIPES.map((item) => ({
        recipe: toRecipeRow(item),
        ingredients: toRecipeIngredientRows(item),
      }))
    );
  });

  it('gives a recipe without ingredient rows an empty list', () => {
    expect(withIngredients(rows, [])).toEqual(
      rows.map((recipe) => ({ recipe, ingredients: [] }))
    );
  });

  it('keeps every ingredient row exactly once', () => {
    const paired = withIngredients(rows, all);

    expect(paired.flatMap((item) => item.ingredients)).toHaveLength(5);
  });
});
