import type { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getRecipes } from './use-get-recipes';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item = { id: 'iron-ingot-smelting' } as Recipe;

describe('getRecipes', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /recipes and returns the recipes', async () => {
    get.mockResolvedValue({
      data: { success: true, data: { recipes: [item] } },
    });

    await expect(getRecipes()).resolves.toEqual([item]);
    expect(get).toHaveBeenCalledWith('http://api.test/api/recipes');
  });

  it('returns an empty list as is', async () => {
    get.mockResolvedValue({ data: { success: true, data: { recipes: [] } } });

    await expect(getRecipes()).resolves.toEqual([]);
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'validation_failed' } },
    });

    await expect(getRecipes()).rejects.toThrow('Api error');
  });

  it('rejects when the request fails', async () => {
    const error = new Error('Network Error');
    get.mockRejectedValue(error);

    await expect(getRecipes()).rejects.toBe(error);
  });
});
