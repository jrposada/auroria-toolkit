export type TooltipPositionInput = {
  /** Viewport coordinates, as returned by getBoundingClientRect. */
  anchor: { top: number; bottom: number; left: number; width: number };
  tooltip: { width: number; height: number };
  viewport: { width: number; height: number };
};

export type TooltipPosition = {
  top: number;
  left: number;
  placement: 'below' | 'above';
};

export const TOOLTIP_GAP = 8;
export const TOOLTIP_MARGIN = 12;

export function computeTooltipPosition({
  anchor,
  tooltip,
  viewport,
}: TooltipPositionInput): TooltipPosition {
  const centred = anchor.left + anchor.width / 2 - tooltip.width / 2;
  // The outer max wins, so a tooltip wider than the viewport keeps its left edge visible.
  const left = Math.max(
    TOOLTIP_MARGIN,
    Math.min(centred, viewport.width - tooltip.width - TOOLTIP_MARGIN)
  );

  const below = anchor.bottom + TOOLTIP_GAP;
  const leavesBottom = below + tooltip.height > viewport.height;
  const fitsAbove = anchor.top > tooltip.height + 2 * TOOLTIP_GAP;

  if (leavesBottom && fitsAbove) {
    return {
      top: anchor.top - tooltip.height - TOOLTIP_GAP,
      left,
      placement: 'above',
    };
  }

  return { top: below, left, placement: 'below' };
}
