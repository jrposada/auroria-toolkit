import type {
  RecipesGetByIdParams,
  RecipesGetByIdResponse,
} from '@jrposada/auroria-toolkit-shared/models/recipes/recipes-get-by-id';

import { getRecipeById } from '../../../services/recipe.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiRecipe } from '../../mappers/recipes.ts';

const handler = toRequestHandler<RecipesGetByIdResponse, RecipesGetByIdParams>(
  async (request) => {
    const { id } = request.params;

    const recipe = await getRecipeById(id);

    return {
      statusCode: 200,
      body: {
        success: true,
        data: {
          recipe: toApiRecipe(recipe),
        },
      },
    };
  }
);

export { handler };
