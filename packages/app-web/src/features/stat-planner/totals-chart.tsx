import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../../ui/card/card';
import LineChart from '../../ui/line-chart/line-chart';
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
    <Card
      title={t('stat_planner.totals.title', { maxLevel })}
      aside={t('stat_planner.totals.marker')}
    >
      <LineChart
        ariaLabel={t('stat_planner.totals.aria', { maxLevel })}
        series={[
          {
            id: 'str',
            label: t('stat_planner.stats.short.str'),
            color: 'var(--accent)',
            values: totals.str,
          },
          {
            id: 'con',
            label: t('stat_planner.stats.short.con'),
            color: 'var(--con)',
            values: totals.con,
          },
          {
            id: 'tal',
            label: t('stat_planner.stats.short.tal'),
            color: 'var(--brass)',
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
    </Card>
  );
};

export default TotalsChart;
