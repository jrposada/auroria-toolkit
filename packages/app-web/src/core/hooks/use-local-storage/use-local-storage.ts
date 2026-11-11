import { useCallback, useState } from 'react';

// Storage can be missing (no window) or blocked (private mode, site settings).
export function getLocalStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredValue<T>(
  storage: Pick<Storage, 'getItem'> | null,
  key: string,
  defaultValue: T
): T {
  try {
    const stored = storage?.getItem(key);

    return stored == null ? defaultValue : (JSON.parse(stored) as T);
  } catch {
    return defaultValue;
  }
}

export function writeStoredValue(
  storage: Pick<Storage, 'setItem'> | null,
  key: string,
  value: unknown
): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best effort; the in-memory value still applies.
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (nextValue: T) => void] {
  const [value, setValue] = useState(() =>
    readStoredValue(getLocalStorage(), key, defaultValue)
  );

  const setLocalStorageValue = useCallback(
    (nextValue: T) => {
      writeStoredValue(getLocalStorage(), key, nextValue);
      setValue(nextValue);
    },
    [key]
  );

  return [value, setLocalStorageValue];
}
