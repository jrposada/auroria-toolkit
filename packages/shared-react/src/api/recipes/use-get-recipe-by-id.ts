import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import { RecipesGetByIdResponse } from '@jrposada/auroria-toolkit-shared/models/recipes/recipes-get-by-id';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

type UseGetRecipeById = {
  id: string | undefined;
};

async function getRecipeById(id: string): Promise<Recipe> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<RecipesGetByIdResponse>>(
    `${apiBaseUrl}/recipes/${encodeURIComponent(id)}`
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.recipe;
}

function useGetRecipeById({ id }: UseGetRecipeById) {
  return useQuery({
    queryKey: ['recipes', { id }],
    queryFn: query({ fn: () => getRecipeById(id!) }),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export { getRecipeById, useGetRecipeById };
