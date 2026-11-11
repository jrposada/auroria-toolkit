import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Tooltip from './tooltip';
import TooltipPanel from './tooltip-panel';

describe('Given <TooltipPanel/>', () => {
  it('when positioned then it is a tooltip placed at that position with its accent', () => {
    const html = renderToStaticMarkup(
      <TooltipPanel
        id="tip"
        accent="var(--r-epic)"
        position={{ top: 168, left: 277, placement: 'below' }}
      >
        Body
      </TooltipPanel>
    );

    expect(html).toContain('role="tooltip"');
    expect(html).toContain('id="tip"');
    expect(html).toContain('data-placement="below"');
    expect(html).toContain('--tooltip-accent:var(--r-epic)');
    expect(html).toContain('top:168px');
    expect(html).toContain('left:277px');
    expect(html).toContain('Body');
  });

  it('when not yet positioned then it is hidden', () => {
    const html = renderToStaticMarkup(
      <TooltipPanel id="tip">Body</TooltipPanel>
    );

    expect(html).toContain('visibility:hidden');
  });
});

describe('Given <Tooltip/>', () => {
  it('when it has no anchor then it renders nothing', () => {
    const html = renderToStaticMarkup(
      <Tooltip id="tip" anchor={null} onClose={() => {}}>
        Body
      </Tooltip>
    );

    expect(html).toBe('');
  });
});
