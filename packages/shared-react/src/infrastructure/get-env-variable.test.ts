import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEnvVariable } from './get-env-variable';

describe('getEnvVariable', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the VITE_-prefixed variable', () => {
    vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://api.test/api');

    expect(getEnvVariable('PUBLIC_API_BASE_URL')).toBe('http://api.test/api');
  });

  it('throws when the variable is not defined', () => {
    expect(() => getEnvVariable('MISSING')).toThrow(
      'Environment variable MISSING is not defined'
    );
  });
});
