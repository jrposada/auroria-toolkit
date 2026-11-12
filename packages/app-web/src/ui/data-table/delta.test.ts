import { describe, expect, it } from 'vitest';

import { formatDelta } from './delta';

describe('formatDelta', () => {
  it.each([
    [6, '+6', 'up'],
    [-41, '−41', 'down'],
    [0, '0', 'zero'],
    [NaN, '–', 'zero'],
    [Infinity, '–', 'zero'],
  ] as const)('when the delta is %s then it reads %s', (value, text, sign) => {
    expect(formatDelta(value)).toEqual({ text, sign });
  });
});
