import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import LineChart from './line-chart';

const count = (html: string, needle: string) => html.split(needle).length - 1;
const rising = (end: number) =>
  Array.from({ length: 40 }, (_, i) => Math.round((end * (i + 1)) / 40));

const props = {
  ariaLabel: 'Stat totals, level 1 to 40',
  xTicks: [1, 10, 20, 30, 40],
  yStep: 20,
  series: [
    { id: 'str', label: 'STR', color: 'var(--accent)', values: rising(95) },
    { id: 'con', label: 'CON', color: 'var(--con)', values: rising(56) },
  ],
};

describe('Given <LineChart/>', () => {
  const html = renderToStaticMarkup(<LineChart {...props} />);

  it('then it draws an accessible svg with one path per series', () => {
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Stat totals, level 1 to 40"');
    expect(html).toContain('viewBox="0 0 760 300"');
    expect(count(html, 'data-series=')).toBe(2);
  });

  it('then it draws gridlines and tick labels', () => {
    expect(count(html, 'data-grid')).toBe(6);
    expect(count(html, 'data-y-tick')).toBe(6);
    expect(count(html, 'data-x-tick')).toBe(5);
  });

  it('then it labels each series end with its last value', () => {
    expect(html).toContain('>STR 95<');
    expect(html).toContain('>CON 56<');
  });

  it('then it colours by css variable', () => {
    expect(html).toContain('stroke:var(--accent)');
  });

  it('then it draws no marker without markerX', () => {
    expect(count(html, 'data-marker')).toBe(0);
  });

  it('when markerX is set then it marks it with one dot per series', () => {
    const marked = renderToStaticMarkup(<LineChart {...props} markerX={27} />);

    expect(count(marked, 'data-marker=')).toBe(1);
    expect(count(marked, 'data-marker-dot')).toBe(2);
    expect(marked).toContain('<title>STR 64</title>');
  });

  it.each([0, 41, 27.5])(
    'when markerX is %s then it draws no marker',
    (markerX) => {
      const marked = renderToStaticMarkup(
        <LineChart {...props} markerX={markerX} />
      );

      expect(count(marked, 'data-marker')).toBe(0);
    }
  );

  it.each([
    ['no series', []],
    ['an empty series', [{ id: 'a', label: 'A', color: 'red', values: [] }]],
    ['a single value', [{ id: 'a', label: 'A', color: 'red', values: [5] }]],
    ['all zeros', [{ id: 'a', label: 'A', color: 'red', values: [0, 0, 0] }]],
    [
      'non-finite values',
      [{ id: 'a', label: 'A', color: 'red', values: [1, NaN, Infinity] }],
    ],
    [
      'only non-finite values',
      [{ id: 'a', label: 'A', color: 'red', values: [NaN, NaN] }],
    ],
  ])('when given %s then the markup stays finite', (_, series) => {
    const degenerate = renderToStaticMarkup(
      <LineChart {...props} series={series} markerX={1} />
    );

    expect(degenerate).toContain('<svg');
    expect(degenerate).not.toMatch(/NaN|Infinity/);
  });
});
