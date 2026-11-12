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

  it('when it has a hint then the control is described by it', () => {
    const html = renderToStaticMarkup(
      <Field label="Talent start level" hint="2 to 40">
        <input type="number" />
      </Field>
    );
    const id = /aria-describedby="([^"]+)"/.exec(html)?.[1];

    expect(id).toBeDefined();
    expect(html).toMatch(
      new RegExp(`<span[^>]*id="${id}"[^>]*>2 to 40</span>`)
    );
    expect(html).not.toContain('aria-invalid');
  });

  it('when it has an error then the control is invalid and described by the error instead of the hint', () => {
    const html = renderToStaticMarkup(
      <Field
        label="Talent start level"
        hint="2 to 40"
        error="Enter a level from 2 to 40"
      >
        <input type="number" />
      </Field>
    );
    const id = /aria-describedby="([^"]+)"/.exec(html)?.[1];

    expect(id).toBeDefined();
    expect(html).toContain('aria-invalid="true"');
    expect(html).toMatch(
      new RegExp(
        `<span[^>]*id="${id}"[^>]*data-error[^>]*>Enter a level from 2 to 40</span>`
      )
    );
    expect(html).not.toContain('>2 to 40</span>');
  });

  it('when it has neither then the control is described by nothing', () => {
    const html = renderToStaticMarkup(
      <Field label="Ratio">
        <select aria-invalid />
      </Field>
    );

    expect(html).not.toContain('aria-describedby');
    expect(html).toContain('aria-invalid="true"');
  });
});
