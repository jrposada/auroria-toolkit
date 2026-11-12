import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { ClassesGetByIdResponse } from '@jrposada/auroria-toolkit-shared/models/classes/classes-get-by-id';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

type UseGetClassById = {
  id: string | undefined;
};

async function getClassById(id: string): Promise<Class> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<ClassesGetByIdResponse>>(
    `${apiBaseUrl}/classes/${encodeURIComponent(id)}`
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.class;
}

function useGetClassById({ id }: UseGetClassById) {
  return useQuery({
    queryKey: ['classes', { id }],
    queryFn: query({ fn: () => getClassById(id!) }),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export { getClassById, useGetClassById };
