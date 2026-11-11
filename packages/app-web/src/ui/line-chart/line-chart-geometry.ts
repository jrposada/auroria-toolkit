export type LineChartSeries = {
  id: string;
  label: string;
  /** Any CSS colour, e.g. 'var(--accent)'. */
  color: string;
  values: number[];
};

export type Plot = { x0: number; x1: number; y0: number; y1: number };

export const CHART_WIDTH = 760;

export function plotArea(height: number, endLabelSpace: number): Plot {
  return { x0: 48, x1: CHART_WIDTH - endLabelSpace, y0: 20, y1: height - 40 };
}

export function yAxisMax(series: LineChartSeries[], yStep: number): number {
  const max = Math.max(
    0,
    ...series.flatMap((s) => s.values).filter(Number.isFinite)
  );

  if (!(yStep > 0)) {
    return max || 1;
  }

  return Math.ceil(max / yStep) * yStep || yStep;
}

export function yTicks(yMax: number, yStep: number): number[] {
  if (!(yStep > 0)) {
    return [0, yMax];
  }

  const ticks: number[] = [];
  for (let tick = 0; tick <= yMax; tick += yStep) {
    ticks.push(tick);
  }

  return ticks;
}

export function scaleX(index: number, count: number, plot: Plot): number {
  if (count <= 1) {
    return plot.x0;
  }

  return plot.x0 + (index / (count - 1)) * (plot.x1 - plot.x0);
}

export function scaleY(value: number, yMax: number, plot: Plot): number {
  if (!Number.isFinite(value)) {
    return plot.y1;
  }

  return plot.y1 - (value / yMax) * (plot.y1 - plot.y0);
}

export function linePath(values: number[], yMax: number, plot: Plot): string {
  return values
    .map((value, index) => {
      const x = scaleX(index, values.length, plot).toFixed(1);
      const y = scaleY(value, yMax, plot).toFixed(1);

      return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join('');
}

/** Sorts labels top to bottom and moves each at least minGap below the previous one. */
export function spreadLabels<T extends { y: number }>(
  labels: T[],
  minGap = 14
): T[] {
  const sorted = labels
    .map((label) => ({ ...label }))
    .sort((a, b) => a.y - b.y);

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1]!;
    const current = sorted[i]!;

    if (current.y - previous.y < minGap) {
      current.y = previous.y + minGap;
    }
  }

  return sorted;
}
