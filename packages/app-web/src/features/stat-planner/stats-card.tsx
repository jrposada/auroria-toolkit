import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../../ui/card/card';
import { pointsSpent, statRows } from './plan-view';
import styles from './stats-card.module.css';
import { Plan } from './use-plan';

type StatsCardProps = {
  plan: Plan;
};

const StatsCard: FunctionComponent<StatsCardProps> = ({ plan }) => {
  const { t } = useTranslation();
  const points = pointsSpent(plan);

  return (
    <Card
      title={t('stat_planner.stats_card.title', { level: plan.level })}
      aside={t('stat_planner.stats_card.points', points)}
    >
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t('stat_planner.stats_card.col_stat')}</th>
              <th scope="col">{t('stat_planner.stats_card.col_base')}</th>
              <th scope="col">{t('stat_planner.stats_card.col_spent')}</th>
              <th scope="col">{t('stat_planner.stats_card.col_total')}</th>
              <td className={styles.barCell} />
            </tr>
          </thead>
          <tbody>
            {statRows(plan).map((row) => (
              <tr key={row.key} data-tone={row.tone}>
                <th scope="row">{t(`stat_planner.stats.${row.key}`)}</th>
                <td>{row.base}</td>
                <td>{row.spent}</td>
                <td className={styles.total}>{row.total}</td>
                <td className={styles.barCell}>
                  <div className={styles.bar} aria-hidden="true">
                    <i style={{ width: `${row.barPct}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StatsCard;
