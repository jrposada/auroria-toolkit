import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { renderRoute } from './test/render-route';

describe('Given the app routes', () => {
  it('when opening / then it redirects to /stat-planner', async () => {
    const { pathname } = await renderRoute('/');

    expect(pathname).toBe('/stat-planner');
  });

  it('when opening /stat-planner then it shows the translated heading inside main', async () => {
    const { html } = await renderRoute('/stat-planner');

    expect(html).toMatch(/<main[^>]*>.*<h1[^>]*>Stat planner<\/h1>/s);
  });

  it('when opening an unknown path then it shows the not-found page with a way back', async () => {
    const { html } = await renderRoute('/nope');

    expect(html).toContain('Page not found');
    expect(html).toMatch(
      /<a[^>]*href="\/stat-planner"[^>]*>Go to the stat planner<\/a>/
    );
  });

  it('when opening /stat-planner then the header shows the product name and marks the current tool', async () => {
    const { html } = await renderRoute('/stat-planner');

    expect(html).toMatch(/<header[^>]*>.*Auroria Toolkit.*<\/header>/s);
    expect(html).toMatch(/<nav[^>]*aria-label="Tools"/);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>Stat planner<\/a>/);
    expect(html).not.toContain('Crafting');
  });

  it('when opening an unknown path then the header and footer render once', async () => {
    const { html } = await renderRoute('/nope');

    expect(html.match(/<header/g)).toHaveLength(1);
    expect(html.match(/<footer/g)).toHaveLength(1);
  });

  it('when game data is still loading then /stat-planner shows the loading state', async () => {
    const { html } = await renderRoute('/stat-planner');

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('<h1');
  });

  it('when game data is cached then /stat-planner shows the placeholder sentence', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['classes', { id: 'warrior' }], {
      name: 'Warrior',
    });
    queryClient.setQueryData(
      ['weapons', { class: 'warrior', type: undefined }],
      new Array(15).fill({})
    );

    const { html } = await renderRoute('/stat-planner', queryClient);

    expect(html).toContain('Game data loaded: Warrior, 15 weapons.');
  });

  it('when a game data request failed then /stat-planner shows the retry message', async () => {
    const queryClient = new QueryClient({
      // Without retryOnMount: false the observer reports a failed query as
      // loading again, expecting a refetch that never runs without a DOM.
      defaultOptions: { queries: { retry: false, retryOnMount: false } },
    });
    await queryClient.prefetchQuery({
      queryKey: ['classes', { id: 'warrior' }],
      queryFn: () => Promise.reject(new Error('down')),
    });

    const { html } = await renderRoute('/stat-planner', queryClient);

    expect(html).toContain('role="alert"');
    expect(html).toContain('>Retry<');
    expect(html).not.toContain('Game data loaded');
  });
});
