import type { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getWeaponById } from './use-get-weapon-by-id';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item = { id: 'wrathful-tyrants-horn' } as Weapon;

describe('getWeaponById', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /weapons/:id and returns the weapon', async () => {
    get.mockResolvedValue({ data: { success: true, data: { weapon: item } } });

    await expect(getWeaponById('wrathful-tyrants-horn')).resolves.toEqual(item);
    expect(get).toHaveBeenCalledWith(
      'http://api.test/api/weapons/wrathful-tyrants-horn'
    );
  });

  it('url-encodes the id', async () => {
    get.mockResolvedValue({ data: { success: true, data: { weapon: item } } });

    await getWeaponById('a/b c');

    expect(get).toHaveBeenCalledWith('http://api.test/api/weapons/a%2Fb%20c');
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'not_found' } },
    });

    await expect(getWeaponById('missing')).rejects.toThrow('Api error');
  });
});
