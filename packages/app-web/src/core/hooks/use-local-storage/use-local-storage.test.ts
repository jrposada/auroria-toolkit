import { describe, expect, it, vi } from 'vitest';

import {
  getLocalStorage,
  readStoredValue,
  writeStoredValue,
} from './use-local-storage';

describe('readStoredValue', () => {
  it('returns the default without storage', () => {
    expect(readStoredValue(null, 'k', 'd')).toBe('d');
  });

  it('returns the default when the key is absent', () => {
    expect(readStoredValue({ getItem: () => null }, 'k', 'd')).toBe('d');
  });

  it('parses a stored string', () => {
    expect(readStoredValue({ getItem: () => '"dark"' }, 'k', 'd')).toBe('dark');
  });

  it('parses a stored object', () => {
    expect(readStoredValue({ getItem: () => '{"level":27}' }, 'k', {})).toEqual(
      { level: 27 }
    );
  });

  it('returns the default when the stored text is not JSON', () => {
    expect(readStoredValue({ getItem: () => 'not json' }, 'k', 'd')).toBe('d');
  });

  it('returns the default when reading throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
    };

    expect(readStoredValue(storage, 'k', 'd')).toBe('d');
  });
});

describe('writeStoredValue', () => {
  it('stores the value as JSON', () => {
    const storage = { setItem: vi.fn() };

    writeStoredValue(storage, 'k', { a: 1 });

    expect(storage.setItem).toHaveBeenCalledWith('k', '{"a":1}');
  });

  it('ignores a failing write', () => {
    const storage = {
      setItem: () => {
        throw new Error('quota');
      },
    };

    expect(() => writeStoredValue(storage, 'k', 1)).not.toThrow();
  });

  it('ignores missing storage', () => {
    expect(() => writeStoredValue(null, 'k', 1)).not.toThrow();
  });
});

describe('getLocalStorage', () => {
  it('returns null where there is no window', () => {
    expect(getLocalStorage()).toBeNull();
  });
});
