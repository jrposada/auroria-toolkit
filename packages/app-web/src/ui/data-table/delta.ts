export type Delta = {
  text: string;
  sign: 'up' | 'down' | 'zero';
};

/** A signed change: "+6", "−41" (minus sign) or "0"; "–" when it can't be computed. */
export function formatDelta(value: number): Delta {
  if (!Number.isFinite(value)) {
    return { text: '–', sign: 'zero' };
  }

  if (value > 0) {
    return { text: `+${value}`, sign: 'up' };
  }

  if (value < 0) {
    return { text: `−${-value}`, sign: 'down' };
  }

  return { text: '0', sign: 'zero' };
}
