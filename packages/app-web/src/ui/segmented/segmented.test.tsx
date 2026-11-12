import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Segmented from './segmented';

const OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

describe('Given <Segmented/>', () => {
  const html = renderToStaticMarkup(
    <Segmented
      label="Theme"
      options={OPTIONS}
      value="light"
      onChange={() => {}}
    />
  );

  it('then it is a radio group named by its label with one radio per option', () => {
    expect(html).toMatch(/^<div[^>]*role="radiogroup"[^>]*aria-label="Theme"/);

    const names = [
      ...html.matchAll(/<input[^>]*type="radio"[^>]*name="([^"]+)"/g),
    ].map((match) => match[1]);
    expect(names).toHaveLength(3);
    expect(new Set(names).size).toBe(1);
  });

  it('then only the current value is checked', () => {
    expect(html.match(/checked=""/g)).toHaveLength(1);
    expect(/<input[^>]*checked=""[^>]*>/.exec(html)?.[0]).toContain(
      'value="light"'
    );
  });
});
