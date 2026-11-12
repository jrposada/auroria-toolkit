import type { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';

import type { RecipeWithIngredients } from '../../services/recipe.ts';

function toApiRecipe({ recipe, ingredients }: RecipeWithIngredients): Recipe {
  return {
    id: recipe.id,
    output: {
      materialId: recipe.outputMaterialId,
      quantity: recipe.outputQuantity,
    },
    station: recipe.station,
    profession: recipe.profession,
    professionLevel: recipe.professionLevel,
    goldCost: recipe.goldCost,
    ingredients: ingredients.map((ingredient) => ({
      materialId: ingredient.materialId,
      quantity: ingredient.quantity,
    })),
  };
}

export { toApiRecipe };
