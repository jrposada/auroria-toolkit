import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Popover from './popover';

describe('Given <Popover/>', () => {
  it('when it has no anchor then it renders nothing', () => {
    const html = renderToStaticMarkup(
      <Popover anchor={null} label="Pick a helmet" onClose={() => {}}>
        Body
      </Popover>
    );

    expect(html).toBe('');
  });
});
