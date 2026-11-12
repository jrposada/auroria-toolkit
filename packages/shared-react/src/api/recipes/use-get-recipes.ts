import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import { RecipesGetResponse } from '@jrposada/auroria-toolkit-shared/models/recipes/recipes-get';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

async function getRecipes(): Promise<Recipe[]> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<RecipesGetResponse>>(
    `${apiBaseUrl}/recipes`
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.recipes;
}

function useGetRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: query({ fn: getRecipes }),
    staleTime: Infinity,
  });
}

export { getRecipes, useGetRecipes };
