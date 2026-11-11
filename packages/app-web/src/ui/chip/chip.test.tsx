import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Chip from './chip';

describe('Given <Chip/>', () => {
  it.each(['strength', 'constitution', 'talent', 'neutral'] as const)(
    'when the variant is %s then it is marked with it',
    (variant) => {
      const html = renderToStaticMarkup(<Chip variant={variant}>+2</Chip>);

      expect(html).toContain(`data-variant="${variant}"`);
      expect(html).toContain('+2');
    }
  );

  it('when no variant is given then it is neutral', () => {
    const html = renderToStaticMarkup(<Chip>Max level</Chip>);

    expect(html).toContain('data-variant="neutral"');
  });
});
