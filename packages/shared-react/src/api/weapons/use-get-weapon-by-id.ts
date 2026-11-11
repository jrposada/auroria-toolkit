import { ApiResponse } from '@jrposada/auroria-toolkit-shared/models/api-response';
import { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { WeaponsGetByIdResponse } from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get-by-id';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getEnvVariable } from '../../infrastructure/get-env-variable';
import { query } from '../query';

type UseGetWeaponById = {
  id: string | undefined;
};

async function getWeaponById(id: string): Promise<Weapon> {
  const apiBaseUrl = getEnvVariable('PUBLIC_API_BASE_URL');
  const response = await axios.get<ApiResponse<WeaponsGetByIdResponse>>(
    `${apiBaseUrl}/weapons/${encodeURIComponent(id)}`
  );

  if (!response.data.success) {
    throw new Error('Api error');
  }

  return response.data.data.weapon;
}

function useGetWeaponById({ id }: UseGetWeaponById) {
  return useQuery({
    queryKey: ['weapons', { id }],
    queryFn: query({ fn: () => getWeaponById(id!) }),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export { getWeaponById, useGetWeaponById };
