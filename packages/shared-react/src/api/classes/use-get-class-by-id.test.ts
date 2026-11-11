import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getClassById } from './use-get-class-by-id';

vi.mock('axios');

const get = vi.mocked(axios.get);
const item = { id: 'warrior' } as Class;

describe('getClassById', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('requests /classes/:id and returns the class', async () => {
    get.mockResolvedValue({ data: { success: true, data: { class: item } } });

    await expect(getClassById('warrior')).resolves.toEqual(item);
    expect(get).toHaveBeenCalledWith('http://api.test/api/classes/warrior');
  });

  it('url-encodes the id', async () => {
    get.mockResolvedValue({ data: { success: true, data: { class: item } } });

    await getClassById('a/b c');

    expect(get).toHaveBeenCalledWith('http://api.test/api/classes/a%2Fb%20c');
  });

  it('rejects when the envelope reports failure', async () => {
    get.mockResolvedValue({
      data: { success: false, data: { code: 'not_found' } },
    });

    await expect(getClassById('missing')).rejects.toThrow('Api error');
  });
});
