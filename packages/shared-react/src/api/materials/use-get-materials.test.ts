import type { Material } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMaterials } from './use-get-materials';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item: Material = { id: 'iron-ore', name: 'Iron Ore' };

describe('getMaterials', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /materials and returns the materials', async () => {
    get.mockResolvedValue({
      data: { success: true, data: { materials: [item] } },
    });

    await expect(getMaterials()).resolves.toEqual([item]);
    expect(get).toHaveBeenCalledWith('http://api.test/api/materials');
  });

  it('returns an empty list as is', async () => {
    get.mockResolvedValue({ data: { success: true, data: { materials: [] } } });

    await expect(getMaterials()).resolves.toEqual([]);
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'validation_failed' } },
    });

    await expect(getMaterials()).rejects.toThrow('Api error');
  });

  it('rejects when the request fails', async () => {
    const error = new Error('Network Error');
    get.mockRejectedValue(error);

    await expect(getMaterials()).rejects.toBe(error);
  });
});
