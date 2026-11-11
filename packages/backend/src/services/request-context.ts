import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContextStore {
  traceId: string;
}

export class RequestContext {
  private static readonly storage =
    new AsyncLocalStorage<RequestContextStore>();

  public static run<T>(store: RequestContextStore, callback: () => T): T {
    return RequestContext.storage.run(store, callback);
  }

  public static getTraceId(): string | undefined {
    return RequestContext.storage.getStore()?.traceId;
  }
}
