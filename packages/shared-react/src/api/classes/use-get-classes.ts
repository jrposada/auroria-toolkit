import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { ClassesGetResponse } from '@jrposada/auroria-toolkit-shared/models/classes/classes-get';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

async function getClasses(): Promise<Class[]> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<ClassesGetResponse>>(
    `${apiBaseUrl}/classes`
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.classes;
}

function useGetClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: query({ fn: getClasses }),
    staleTime: Infinity,
  });
}

export { getClasses, useGetClasses };
