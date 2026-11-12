import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import LineChart from '../../ui/line-chart/line-chart';
import Section from '../../ui/section/section';
import { totalsSeries } from './plan-view';
import { LEVEL_SHORTCUTS } from './planner-form';
import { Plan } from './use-plan';

type TotalsChartProps = {
  plan: Plan;
};

const TotalsChart: FunctionComponent<TotalsChartProps> = ({ plan }) => {
  const { t } = useTranslation();
  const totals = totalsSeries(plan);
  const maxLevel = plan.cls.maxLevel;

  return (
    <Section
      title={t('stat_planner.totals.title', { maxLevel })}
      actions={t('stat_planner.totals.marker')}
    >
      <LineChart
        ariaLabel={t('stat_planner.totals.aria', { maxLevel })}
        series={[
          {
            id: 'str',
            label: t('stat_planner.stats.short.str'),
            color: 'var(--sea)',
            values: totals.str,
          },
          {
            id: 'con',
            label: t('stat_planner.stats.short.con'),
            color: 'var(--ink)',
            dash: '6 4',
            values: totals.con,
          },
          {
            id: 'tal',
            label: t('stat_planner.stats.short.tal'),
            color: 'var(--luna)',
            dash: '2 4',
            values: totals.tal,
          },
        ]}
        xTicks={LEVEL_SHORTCUTS.filter((level) => level <= maxLevel)}
        yStep={20}
        markerX={plan.level}
        height={300}
        xAxisLabel={t('stat_planner.totals.x_axis')}
        markerTitle={(series, value) =>
          t('stat_planner.totals.marker_title', {
            label: series.label,
            value: Math.round(value),
            level: plan.level,
          })
        }
      />
    </Section>
  );
};

export default TotalsChart;
