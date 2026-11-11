import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getClasses } from './use-get-classes';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item = { id: 'an-id' } as Class;

describe('getClasses', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /classes and returns the classes', async () => {
    get.mockResolvedValue({
      data: { success: true, data: { classes: [item] } },
    });

    await expect(getClasses()).resolves.toEqual([item]);
    expect(get).toHaveBeenCalledWith('http://api.test/api/classes');
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'validation_failed' } },
    });

    await expect(getClasses()).rejects.toThrow('Api error');
  });

  it('rejects when the request fails', async () => {
    const error = new Error('Network Error');
    get.mockRejectedValue(error);

    await expect(getClasses()).rejects.toBe(error);
  });
});
