import { describe, expect, it } from 'vitest';

import { availablePoints } from './available-points.ts';

describe('availablePoints', () => {
  it.each([
    [1, 0],
    [2, 3],
    [30, 87],
    [40, 117],
  ])('level %i has %i points', (level, points) => {
    expect(availablePoints(level)).toBe(points);
  });

  it('uses the given points per level', () => {
    expect(availablePoints(11, 2)).toBe(20);
  });
});
