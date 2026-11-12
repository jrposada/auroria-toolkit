export type DataStatus = 'loading' | 'error' | 'ready';

type QueryState = {
  isPending: boolean;
  isError: boolean;
};

export function combineQueryStatus(queries: QueryState[]): DataStatus {
  if (queries.some((query) => query.isError)) {
    return 'error';
  }

  return queries.some((query) => query.isPending) ? 'loading' : 'ready';
}
