import { FunctionComponent } from 'react';

import styles from './line-chart.module.css';
import {
  CHART_WIDTH,
  LineChartSeries,
  linePath,
  plotArea,
  scaleX,
  scaleY,
  spreadLabels,
  yAxisMax,
  yTicks,
} from './line-chart-geometry';

type LineChartProps = {
  ariaLabel: string;
  series: LineChartSeries[];
  /** The x values to label, e.g. [1, 10, 20, 30, 40]. */
  xTicks: number[];
  /** Gridline interval. */
  yStep: number;
  /** The x value of each series' first value. */
  xStart?: number;
  /** The x value to mark with a vertical line and a dot per series. */
  markerX?: number;
  /** viewBox height; the width is fixed at 760. */
  height?: number;
  /** Width reserved right of the plot for the end labels. */
  endLabelSpace?: number;
  xAxisLabel?: string;
  caption?: string;
  formatValue?: (value: number) => string;
  markerTitle?: (series: LineChartSeries, value: number) => string;
};

const LineChart: FunctionComponent<LineChartProps> = ({
  ariaLabel,
  series,
  xTicks,
  yStep,
  xStart = 1,
  markerX,
  height = 300,
  endLabelSpace = 70,
  xAxisLabel,
  caption,
  formatValue = (value) => String(Math.round(value)),
  markerTitle = (s, value) => `${s.label} ${formatValue(value)}`,
}) => {
  const plot = plotArea(height, endLabelSpace);
  const yMax = yAxisMax(series, yStep);
  const count = Math.max(0, ...series.map((s) => s.values.length));
  const x = (index: number) => scaleX(index, count, plot);
  const y = (value: number) => scaleY(value, yMax, plot);

  const endLabels = spreadLabels(
    series.flatMap((s) => {
      const last = s.values.filter(Number.isFinite).at(-1);

      return last === undefined
        ? []
        : [
            {
              id: s.id,
              color: s.color,
              y: y(last),
              text: `${s.label} ${formatValue(last)}`,
            },
          ];
    })
  );

  const markerIndex = markerX === undefined ? -1 : markerX - xStart;
  const hasMarker =
    Number.isInteger(markerIndex) && markerIndex >= 0 && markerIndex < count;

  return (
    <div className={styles.chart} data-chart>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        className={styles.svg}
      >
        {yTicks(yMax, yStep).map((tick) => (
          <g key={tick}>
            <line
              data-grid
              className={styles.grid}
              x1={plot.x0}
              x2={plot.x1}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text
              data-y-tick
              className={styles.tick}
              x={plot.x0 - 8}
              y={y(tick) + 4}
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        ))}

        {xTicks
          .filter((tick) => tick - xStart >= 0 && tick - xStart < count)
          .map((tick) => (
            <text
              key={tick}
              data-x-tick
              className={styles.tick}
              x={x(tick - xStart)}
              y={plot.y1 + 18}
              textAnchor="middle"
            >
              {tick}
            </text>
          ))}

        {xAxisLabel && (
          <text
            className={styles.axisLabel}
            x={(plot.x0 + plot.x1) / 2}
            y={height - 4}
            textAnchor="middle"
          >
            {xAxisLabel}
          </text>
        )}

        {caption && (
          <text className={styles.axisLabel} x={plot.x0} y={plot.y0 - 6}>
            {caption}
          </text>
        )}

        {series.map((s) => (
          <path
            key={s.id}
            data-series={s.id}
            className={styles.line}
            d={linePath(s.values, yMax, plot)}
            style={{ stroke: s.color }}
          />
        ))}

        {endLabels.map((label) => (
          <text
            key={label.id}
            data-end-label
            className={styles.endLabel}
            x={plot.x1 + 8}
            y={label.y + 4}
            style={{ fill: label.color }}
          >
            {label.text}
          </text>
        ))}

        {hasMarker && (
          <>
            <line
              data-marker=""
              className={styles.marker}
              x1={x(markerIndex)}
              x2={x(markerIndex)}
              y1={plot.y0}
              y2={plot.y1}
            />
            {series.map((s) => {
              const value = s.values[markerIndex];

              return value === undefined || !Number.isFinite(value) ? null : (
                <circle
                  key={s.id}
                  data-marker-dot
                  className={styles.dot}
                  cx={x(markerIndex)}
                  cy={y(value)}
                  r={4.5}
                  style={{ fill: s.color }}
                >
                  <title>{markerTitle(s, value)}</title>
                </circle>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
};

export default LineChart;
