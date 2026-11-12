import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Material } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import { MaterialsGetResponse } from '@jrposada/auroria-toolkit-shared/models/materials/materials-get';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

async function getMaterials(): Promise<Material[]> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<MaterialsGetResponse>>(
    `${apiBaseUrl}/materials`
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.materials;
}

function useGetMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: query({ fn: getMaterials }),
    staleTime: Infinity,
  });
}

export { getMaterials, useGetMaterials };
