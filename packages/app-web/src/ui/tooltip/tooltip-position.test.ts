import { describe, expect, it } from 'vitest';

import { computeTooltipPosition } from './tooltip-position';

const viewport = { width: 1000, height: 800 };
const tooltip = { width: 330, height: 200 };
const anchor = (top: number, left: number) => ({
  top,
  bottom: top + 60,
  left,
  width: 84,
});

describe('computeTooltipPosition', () => {
  it('centres below the anchor', () => {
    expect(
      computeTooltipPosition({ anchor: anchor(100, 400), tooltip, viewport })
    ).toEqual({ top: 168, left: 277, placement: 'below' });
  });

  it('flips above when it would leave the bottom and there is room above', () => {
    expect(
      computeTooltipPosition({ anchor: anchor(600, 400), tooltip, viewport })
    ).toEqual({ top: 392, left: 277, placement: 'above' });
  });

  it('clamps to the left margin', () => {
    expect(
      computeTooltipPosition({ anchor: anchor(100, 0), tooltip, viewport }).left
    ).toBe(12);
  });

  it('clamps to the right margin', () => {
    expect(
      computeTooltipPosition({ anchor: anchor(100, 950), tooltip, viewport })
        .left
    ).toBe(658);
  });

  it('stays below when neither side fits', () => {
    expect(
      computeTooltipPosition({
        anchor: anchor(150, 400),
        tooltip,
        viewport: { width: 1000, height: 300 },
      })
    ).toMatchObject({ top: 218, placement: 'below' });
  });

  it('keeps the left margin when the viewport is narrower than the tooltip', () => {
    expect(
      computeTooltipPosition({
        anchor: anchor(100, 100),
        tooltip,
        viewport: { width: 300, height: 800 },
      }).left
    ).toBe(12);
  });
});
