import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';

import i18n from '../i18n';
import { createAppRouter } from '../router';

export async function renderRoute(
  path: string,
  queryClient: QueryClient = new QueryClient()
): Promise<{ html: string; pathname: string }> {
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] })
  );
  await router.load();

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>
  );

  // Without a DOM the router records a redirect instead of navigating to it.
  const redirectedTo = router.state.redirect?.options.to;

  return {
    html,
    pathname: redirectedTo
      ? String(redirectedTo)
      : router.state.location.pathname,
  };
}
