import { asc, eq } from 'drizzle-orm';

import { getDatabase } from '../data/database.ts';
import type { RecipeIngredientRow, RecipeRow } from '../data/models/recipe.ts';
import { recipeIngredients, recipes } from '../data/models/recipe.ts';
import ResourceNotFound from '../infrastructure/not-found-error.ts';

type RecipeWithIngredients = {
  recipe: RecipeRow;
  ingredients: RecipeIngredientRow[];
};

function withIngredients(
  recipeRows: RecipeRow[],
  ingredientRows: RecipeIngredientRow[]
): RecipeWithIngredients[] {
  const byRecipeId = new Map<string, RecipeIngredientRow[]>();
  for (const row of ingredientRows) {
    const rows = byRecipeId.get(row.recipeId) ?? [];
    rows.push(row);
    byRecipeId.set(row.recipeId, rows);
  }

  return recipeRows.map((recipe) => ({
    recipe,
    ingredients: byRecipeId.get(recipe.id) ?? [],
  }));
}

async function getRecipes(): Promise<RecipeWithIngredients[]> {
  const recipeRows = await getDatabase()
    .select()
    .from(recipes)
    .orderBy(asc(recipes.id));
  // No position column: ingredients come back in materialId order.
  const ingredientRows = await getDatabase()
    .select()
    .from(recipeIngredients)
    .orderBy(
      asc(recipeIngredients.recipeId),
      asc(recipeIngredients.materialId)
    );

  return withIngredients(recipeRows, ingredientRows);
}

async function getRecipeById(id: string): Promise<RecipeWithIngredients> {
  const [recipe] = await getDatabase()
    .select()
    .from(recipes)
    .where(eq(recipes.id, id));

  if (!recipe) {
    throw new ResourceNotFound(`Recipe with id ${id} not found`);
  }

  const ingredients = await getDatabase()
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, id))
    .orderBy(asc(recipeIngredients.materialId));

  return { recipe, ingredients };
}

export type { RecipeWithIngredients };
export { getRecipeById, getRecipes, withIngredients };
