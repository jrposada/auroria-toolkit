import { describe, expect, it } from 'vitest';

import { recipeSchema } from './recipe.ts';
import { recipesGetByIdParamsSchema } from './recipes-get-by-id.ts';

const smelting = {
  id: 'iron-ingot-smelting',
  output: { materialId: 'iron-ingot', quantity: 1 },
  station: 'Smelter',
  profession: 'Metalwork',
  professionLevel: 0,
  goldCost: 0,
  ingredients: [{ materialId: 'iron-ore', quantity: 3 }],
};

function rejects(recipe: unknown) {
  expect(recipeSchema.safeParse(recipe).success).toBe(false);
}

describe('recipeSchema', () => {
  it('accepts a valid recipe, with zero profession level and gold cost', () => {
    expect(recipeSchema.parse(smelting)).toEqual(smelting);
  });

  it('accepts a recipe with no ingredients', () => {
    expect(
      recipeSchema.safeParse({ ...smelting, ingredients: [] }).success
    ).toBe(true);
  });

  it('rejects an id that is not a slug', () => {
    rejects({ ...smelting, id: 'Iron Ingot' });
  });

  it('rejects an output material that is not a slug', () => {
    rejects({ ...smelting, output: { materialId: 'Iron Ingot', quantity: 1 } });
  });

  it('rejects an ingredient material that is not a slug', () => {
    rejects({
      ...smelting,
      ingredients: [{ materialId: 'Iron Ore', quantity: 3 }],
    });
  });

  it.each([0, -1, 1.5])('rejects an output quantity of %s', (quantity) => {
    rejects({ ...smelting, output: { materialId: 'iron-ingot', quantity } });
  });

  it.each([0, -1, 1.5])('rejects an ingredient quantity of %s', (quantity) => {
    rejects({
      ...smelting,
      ingredients: [{ materialId: 'iron-ore', quantity }],
    });
  });

  it.each([-1, 1.5])('rejects a profession level of %s', (professionLevel) => {
    rejects({ ...smelting, professionLevel });
  });

  it.each([-1, 1.5])('rejects a gold cost of %s', (goldCost) => {
    rejects({ ...smelting, goldCost });
  });

  it('rejects a missing station', () => {
    const withoutStation = Object.fromEntries(
      Object.entries(smelting).filter(([key]) => key !== 'station')
    );
    rejects(withoutStation);
  });
});

describe('recipesGetByIdParamsSchema', () => {
  it('rejects an empty id', () => {
    expect(recipesGetByIdParamsSchema.safeParse({ id: '' }).success).toBe(
      false
    );
  });
});
