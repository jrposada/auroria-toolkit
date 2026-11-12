import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Button from './button';

describe('Given <Button/>', () => {
  it('then it is a quiet, medium type="button" by default', () => {
    const html = renderToStaticMarkup(<Button>Retry</Button>);

    expect(html).toMatch(/^<button[^>]*type="button"[^>]*>Retry<\/button>$/);
    expect(html).toContain('data-variant="quiet"');
    expect(html).toContain('data-size="md"');
  });

  it.each([
    ['primary', 'sm'],
    ['quiet', 'sm'],
    ['primary', 'md'],
  ] as const)(
    'when it is %s and %s then it is marked with both',
    (variant, size) => {
      const html = renderToStaticMarkup(
        <Button variant={variant} size={size}>
          Go
        </Button>
      );

      expect(html).toContain(`data-variant="${variant}"`);
      expect(html).toContain(`data-size="${size}"`);
    }
  );

  it('when it is a submit button then it keeps its type', () => {
    const html = renderToStaticMarkup(<Button type="submit">Save</Button>);

    expect(html).toContain('type="submit"');
  });

  it('when it is pressed then it says so', () => {
    const html = renderToStaticMarkup(<Button aria-pressed>Lv 30</Button>);

    expect(html).toContain('aria-pressed="true"');
  });

  it('when it is disabled then the button is disabled', () => {
    const html = renderToStaticMarkup(<Button disabled>Retry</Button>);

    expect(html).toContain('disabled=""');
  });
});
