import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { WARRIOR, WEAPONS } from './features/stat-planner/test/game-data';
import { renderRoute } from './test/render-route';

function navLinkTag(html: string, label: string): string {
  const match = html.match(new RegExp(`<a[^>]*>${label}</a>`));
  if (!match) throw new Error(`No link labelled ${label}`);
  return match[0];
}

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
    expect(html).toMatch(/<a[^>]*href="\/crafting"[^>]*>Crafting<\/a>/);
    expect(navLinkTag(html, 'Crafting')).not.toContain('aria-current');
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
    expect(html).toContain('aria-label="Character level"');
  });

  it('when game data is cached then /stat-planner shows the planner inside main', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['classes', { id: 'warrior' }], WARRIOR);
    queryClient.setQueryData(
      ['weapons', { class: 'warrior', type: undefined }],
      WEAPONS
    );

    const { html } = await renderRoute('/stat-planner', queryClient);

    expect(html).toMatch(/<main[^>]*>.*Stats at level 1.*<\/main>/s);
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
    expect(html).not.toContain('Stats at level');
  });

  it('when opening /crafting with no recipes then it shows the empty state with a way back', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['recipes'], []);

    const { html } = await renderRoute('/crafting', queryClient);

    expect(html).toMatch(/<main[^>]*>.*<h1[^>]*>Crafting<\/h1>/s);
    expect(html.replace(/<[^>]+>/g, '').replaceAll('&#x27;', "'")).toContain(
      "Recipe data isn't in yet. Once it is, pick a recipe to see the materials and gold it takes."
    );
    expect(html).toMatch(
      /<a[^>]*href="\/stat-planner"[^>]*>Go to the stat planner<\/a>/
    );
    expect(html).not.toContain('aria-busy');
    expect(html).not.toContain('role="alert"');
  });

  it('when opening /crafting then the header marks Crafting as the current tool', async () => {
    const { html } = await renderRoute('/crafting');

    expect(navLinkTag(html, 'Crafting')).toContain('aria-current="page"');
    expect(navLinkTag(html, 'Stat planner')).not.toContain('aria-current');
  });

  it('when recipes are still loading then /crafting shows the loading state, not the empty state', async () => {
    const { html } = await renderRoute('/crafting');

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('<h1');
    expect(html).not.toContain('Once it is, pick a recipe');
  });

  it('when the recipes request failed then /crafting shows the retry message, not the empty state', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, retryOnMount: false } },
    });
    await queryClient.prefetchQuery({
      queryKey: ['recipes'],
      queryFn: () => Promise.reject(new Error('down')),
    });

    const { html } = await renderRoute('/crafting', queryClient);

    expect(html).toContain('role="alert"');
    expect(html).toContain('>Retry<');
    expect(html).not.toContain('Once it is, pick a recipe');
  });

  it('when recipes exist then /crafting says how many and drops the empty state', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['recipes'], new Array(3).fill({}));

    const { html } = await renderRoute('/crafting', queryClient);

    expect(html).toContain(
      'Recipes loaded: 3. The calculator itself is not built yet.'
    );
    expect(html).not.toContain('Once it is, pick a recipe');
  });
});
