import { AxiosError } from 'axios';

export type QueryParams<TResponse> = {
  fn: () => Promise<TResponse>;
  refreshToken?: () => Promise<void>;
  logout?: () => Promise<void>;
};

export function query<TResponse>({
  fn,
  refreshToken,
  logout,
}: QueryParams<TResponse>): () => Promise<TResponse> {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof AxiosError &&
        (error.status === 401 || error.status === 403)
      ) {
        try {
          await refreshToken?.();
          return await fn();
        } catch {
          await logout?.();
        }
      }

      // Rethrown so an unreachable API surfaces as an error state.
      throw error;
    }
  };
}
