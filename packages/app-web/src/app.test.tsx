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

  it('when opening an unknown path then the header and footer still render', async () => {
    const { html } = await renderRoute('/nope');

    expect(html).toContain('<header');
    expect(html).toContain('<footer');
  });
});
