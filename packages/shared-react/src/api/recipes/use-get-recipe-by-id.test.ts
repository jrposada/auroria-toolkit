import type { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getRecipeById } from './use-get-recipe-by-id';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item = { id: 'iron-ingot-smelting' } as Recipe;

describe('getRecipeById', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /recipes/:id and returns the recipe', async () => {
    get.mockResolvedValue({ data: { success: true, data: { recipe: item } } });

    await expect(getRecipeById('iron-ingot-smelting')).resolves.toEqual(item);
    expect(get).toHaveBeenCalledWith(
      'http://api.test/api/recipes/iron-ingot-smelting'
    );
  });

  it('url-encodes the id', async () => {
    get.mockResolvedValue({ data: { success: true, data: { recipe: item } } });

    await getRecipeById('a/b c');

    expect(get).toHaveBeenCalledWith('http://api.test/api/recipes/a%2Fb%20c');
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'not_found' } },
    });

    await expect(getRecipeById('missing')).rejects.toThrow('Api error');
  });
});
