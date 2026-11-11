import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { mutation } from './mutation';

describe('mutation', () => {
  it('passes variables to fn and returns its result', async () => {
    const fn = vi.fn().mockResolvedValue('saved');

    await expect(mutation({ fn })({ id: 'a' })).resolves.toBe('saved');
    expect(fn).toHaveBeenCalledWith({ id: 'a' });
  });

  it('rethrows a non-auth error', async () => {
    const error = new AxiosError('Network Error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(mutation({ fn })(undefined)).rejects.toBe(error);
  });
});
