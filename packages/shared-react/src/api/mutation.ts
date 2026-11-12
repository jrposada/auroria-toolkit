import { AxiosError } from 'axios';

export type MutationParams<TResponse, TVariables> = {
  fn: (variables: TVariables) => Promise<TResponse>;
  refreshToken?: () => Promise<void>;
  logout?: () => Promise<void>;
};

export function mutation<TResponse, TVariables>({
  fn,
  refreshToken,
  logout,
}: MutationParams<TResponse, TVariables>): (
  variables: TVariables
) => Promise<TResponse> {
  return async (variables: TVariables): Promise<TResponse> => {
    try {
      return await fn(variables);
    } catch (error) {
      if (
        error instanceof AxiosError &&
        (error.status === 401 || error.status === 403)
      ) {
        try {
          await refreshToken?.();
          return await fn(variables);
        } catch {
          await logout?.();
        }
      }

      throw error;
    }
  };
}
