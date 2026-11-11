import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { query } from './query';

function authError(status: number): AxiosError {
  const error = new AxiosError('x');
  error.status = status;
  return error;
}

describe('query', () => {
  it('returns what fn resolves', async () => {
    const fn = vi.fn().mockResolvedValue('value');

    await expect(query({ fn })()).resolves.toBe('value');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('rethrows a non-auth AxiosError', async () => {
    const error = authError(500);
    const refreshToken = vi.fn();
    const logout = vi.fn();
    const fn = vi.fn().mockRejectedValue(error);

    await expect(query({ fn, refreshToken, logout })()).rejects.toBe(error);
    expect(refreshToken).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });

  it('rethrows a network error with no status', async () => {
    const error = new AxiosError('Network Error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(query({ fn })()).rejects.toBe(error);
  });

  it('rethrows a plain Error', async () => {
    const error = new Error('Api error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(query({ fn })()).rejects.toBe(error);
  });

  it.each([401, 403])(
    'on %i refreshes the token and retries once',
    async (status) => {
      const refreshToken = vi.fn().mockResolvedValue(undefined);
      const logout = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(authError(status))
        .mockResolvedValueOnce('ok');

      await expect(query({ fn, refreshToken, logout })()).resolves.toBe('ok');
      expect(refreshToken).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(logout).not.toHaveBeenCalled();
    }
  );

  it('on 401 logs out and rethrows the first error when the retry fails', async () => {
    const firstError = authError(401);
    const logout = vi.fn().mockResolvedValue(undefined);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(firstError)
      .mockRejectedValueOnce(new Error('still unauthorized'));

    await expect(query({ fn, logout })()).rejects.toBe(firstError);
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
