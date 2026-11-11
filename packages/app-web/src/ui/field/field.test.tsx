import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Field from './field';

describe('Given <Field/>', () => {
  it('when it has a hint then the label wraps the text, the control and the hint', () => {
    const html = renderToStaticMarkup(
      <Field label="Talent start level" hint="2 to 40">
        <input type="number" />
      </Field>
    );

    expect(html).toMatch(
      /^<label[^>]*>.*Talent start level.*<input[^>]*type="number"[^>]*\/>.*2 to 40.*<\/label>$/s
    );
  });

  it('when it has no hint then only the label text is added', () => {
    const html = renderToStaticMarkup(
      <Field label="Ratio">
        <select />
      </Field>
    );

    expect(html).toContain('<select');
    expect(html.match(/<span/g)).toHaveLength(1);
  });
});
