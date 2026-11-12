import { useCallback, useSyncExternalStore } from 'react';

function matches(query: string): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia
    ? window.matchMedia(query).matches
    : false;
}

/** False on the server and where matchMedia is missing. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
      }

      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);

      return () => media.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => matches(query),
    () => false
  );
}
