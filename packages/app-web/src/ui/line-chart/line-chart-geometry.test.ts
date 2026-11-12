import { describe, expect, it } from 'vitest';

import {
  LineChartSeries,
  linePath,
  plotArea,
  scaleX,
  scaleY,
  spreadLabels,
  yAxisMax,
  yTicks,
} from './line-chart-geometry';

const plot = { x0: 48, x1: 690, y0: 20, y1: 260 };
const series = (...values: number[][]): LineChartSeries[] =>
  values.map((v, i) => ({
    id: `s${i}`,
    label: `S${i}`,
    color: 'red',
    values: v,
  }));

describe('plotArea', () => {
  it('reserves the axis and end-label margins', () => {
    expect(plotArea(300, 70)).toEqual(plot);
  });
});

describe('yAxisMax', () => {
  it('rounds the largest value up to a step', () => {
    expect(yAxisMax(series([18, 95], [8, 56]), 20)).toBe(100);
  });

  it.each([
    ['all zeros', series([0, 0])],
    ['no series', series()],
  ])('is one step for %s', (_, input) => {
    expect(yAxisMax(input, 20)).toBe(20);
  });

  it.each([0, -5, NaN])('is the largest value for a step of %s', (step) => {
    expect(yAxisMax(series([18, 95]), step)).toBe(95);
  });

  it('ignores non-finite values', () => {
    expect(yAxisMax(series([NaN, 30, Infinity]), 20)).toBe(40);
  });
});

describe('yTicks', () => {
  it('lists every step from zero to the maximum', () => {
    expect(yTicks(100, 20)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it.each([0, -5, NaN])('is only the two ends for a step of %s', (step) => {
    expect(yTicks(100, step)).toEqual([0, 100]);
  });
});

describe('scaleX', () => {
  it('spreads indexes across the plot', () => {
    expect(scaleX(0, 40, plot)).toBe(48);
    expect(scaleX(39, 40, plot)).toBe(690);
  });

  it('puts a single value at the left edge', () => {
    expect(scaleX(0, 1, plot)).toBe(48);
  });
});

describe('scaleY', () => {
  it('maps zero to the bottom and the maximum to the top', () => {
    expect(scaleY(0, 100, plot)).toBe(260);
    expect(scaleY(100, 100, plot)).toBe(20);
  });

  it('puts a non-finite value on the baseline', () => {
    expect(scaleY(NaN, 100, plot)).toBe(260);
  });
});

describe('linePath', () => {
  it('draws a move then lines', () => {
    expect(linePath([0, 100], 100, plot)).toBe('M48.0 260.0L690.0 20.0');
  });

  it('is empty for an empty series', () => {
    expect(linePath([], 100, plot)).toBe('');
  });
});

describe('spreadLabels', () => {
  it('sorts by position and pushes close labels apart', () => {
    expect(
      spreadLabels([{ y: 100 }, { y: 104 }, { y: 30 }]).map((l) => l.y)
    ).toEqual([30, 100, 114]);
  });

  it('stacks labels that share a position', () => {
    expect(
      spreadLabels([{ y: 50 }, { y: 50 }, { y: 50 }]).map((l) => l.y)
    ).toEqual([50, 64, 78]);
  });

  it('does not change its input', () => {
    const labels = [{ y: 50 }, { y: 50 }];

    spreadLabels(labels);

    expect(labels).toEqual([{ y: 50 }, { y: 50 }]);
  });
});
