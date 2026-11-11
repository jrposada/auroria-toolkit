import type { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getWeapons } from './use-get-weapons';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item = { id: 'an-id' } as Weapon;

describe('getWeapons', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /weapons and returns the weapons', async () => {
    get.mockResolvedValue({
      data: { success: true, data: { weapons: [item] } },
    });

    await expect(
      getWeapons({ class: 'warrior', type: 'Longsword' })
    ).resolves.toEqual([item]);
    expect(get).toHaveBeenCalledWith('http://api.test/api/weapons', {
      params: { class: 'warrior', type: 'Longsword' },
    });
  });

  it('sends no filter values when called without params', async () => {
    get.mockResolvedValue({ data: { success: true, data: { weapons: [] } } });

    await getWeapons();

    expect(get).toHaveBeenCalledWith('http://api.test/api/weapons', {
      params: { class: undefined, type: undefined },
    });
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'validation_failed' } },
    });

    await expect(getWeapons()).rejects.toThrow('Api error');
  });

  it('rejects when the request fails', async () => {
    const error = new Error('Network Error');
    get.mockRejectedValue(error);

    await expect(getWeapons()).rejects.toBe(error);
  });
});
