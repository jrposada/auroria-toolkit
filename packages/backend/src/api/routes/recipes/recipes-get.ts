import type { RecipesGetResponse } from '@jrposada/auroria-toolkit-shared/models/recipes/recipes-get';

import { getRecipes } from '../../../services/recipe.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiRecipe } from '../../mappers/recipes.ts';

const handler = toRequestHandler<RecipesGetResponse>(async () => {
  const recipes = await getRecipes();

  return {
    statusCode: 200,
    body: {
      success: true,
      data: {
        recipes: recipes.map(toApiRecipe),
      },
    },
  };
});

export { handler };
