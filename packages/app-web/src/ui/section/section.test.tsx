import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Section from './section';

describe('Given <Section/>', () => {
  it('when it has a title and actions then it is a region named by its heading', () => {
    const html = renderToStaticMarkup(
      <Section title="Stats at level 27" actions="81 / 81 points spent">
        body
      </Section>
    );
    const id = /<h2 id="([^"]+)">Stats at level 27<\/h2>/.exec(html)?.[1];

    expect(id).toBeDefined();
    expect(html).toMatch(new RegExp(`^<section[^>]*aria-labelledby="${id}"`));
    expect(html).toContain('81 / 81 points spent');
    expect(html).toContain('body');
  });

  it('when it has no title then it renders no heading and keeps its own label', () => {
    const html = renderToStaticMarkup(
      <Section aria-label="Level">body</Section>
    );

    expect(html).toContain('aria-label="Level"');
    expect(html).not.toContain('<h2');
    expect(html).not.toContain('aria-labelledby');
  });
});
