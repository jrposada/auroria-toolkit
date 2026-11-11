import { createRouter, RouterHistory } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history });
}

export const router = createAppRouter();

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
