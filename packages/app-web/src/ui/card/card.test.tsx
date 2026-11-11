import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Card from './card';

describe('Given <Card/>', () => {
  it('when it has a title and an aside then it renders a headed section', () => {
    const html = renderToStaticMarkup(
      <Card title="Stats at level 27" aside="81 / 81 points spent">
        body
      </Card>
    );

    expect(html).toMatch(/^<section[^>]*>/);
    expect(html).toContain('<h2>Stats at level 27</h2>');
    expect(html).toContain('81 / 81 points spent');
    expect(html).toContain('body');
  });

  it('when it has no title then it renders no heading and keeps its label', () => {
    const html = renderToStaticMarkup(<Card aria-label="Level">body</Card>);

    expect(html).toContain('aria-label="Level"');
    expect(html).not.toContain('<h2');
  });
});
