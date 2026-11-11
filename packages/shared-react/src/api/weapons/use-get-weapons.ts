import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import {
  WeaponsGetQuery,
  WeaponsGetResponse,
} from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

async function getWeapons(params: WeaponsGetQuery = {}): Promise<Weapon[]> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<WeaponsGetResponse>>(
    `${apiBaseUrl}/weapons`,
    { params: { class: params.class, type: params.type } }
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.weapons;
}

function useGetWeapons(params: WeaponsGetQuery = {}) {
  return useQuery({
    queryKey: ['weapons', { class: params.class, type: params.type }],
    queryFn: query({ fn: () => getWeapons(params) }),
    staleTime: Infinity,
  });
}

export { getWeapons, useGetWeapons };
