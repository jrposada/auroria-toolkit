import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../../ui/card/card';
import Chip from '../../ui/chip/chip';
import styles from './next-level-card.module.css';
import { calibrationValues, derivedView, nextLevel } from './plan-view';
import { Plan } from './use-plan';

type NextLevelCardProps = {
  plan: Plan;
};

const CHIP_VARIANTS = {
  str: 'strength',
  con: 'constitution',
  tal: 'talent',
} as const;

const NextLevelCard: FunctionComponent<NextLevelCardProps> = ({ plan }) => {
  const { t } = useTranslation();
  const next = nextLevel(plan);
  const derived = derivedView(plan);
  const estimates = [
    ['next.attack', derived.attack],
    ['next.crit_chance', derived.critChance],
    ['next.crit_damage', derived.critDamageRating],
    ['next.penetration', derived.penetration],
  ] as const;

  return (
    <Card
      title={
        next.kind === 'max'
          ? t('stat_planner.next.title_max', { level: next.level })
          : t('stat_planner.next.title', { from: next.from, to: next.to })
      }
    >
      <div className={styles.body}>
        <div className={styles.chips}>
          {next.kind === 'max' ? (
            <Chip>{t('stat_planner.next.max')}</Chip>
          ) : (
            next.gains.map((gain) => (
              <Chip key={gain.key} variant={CHIP_VARIANTS[gain.key]}>
                {t('stat_planner.next.gain', {
                  amount: gain.amount,
                  stat: t(`stat_planner.stats.${gain.key}`),
                })}
              </Chip>
            ))
          )}
        </div>
        <p className={styles.note}>
          {next.kind === 'max'
            ? t('stat_planner.next.note_max', { points: next.points })
            : next.talentUp
              ? t('stat_planner.next.note_talent', {
                  target: plan.target.total,
                })
              : t('stat_planner.next.note_spend')}
        </p>
        <dl className={styles.estimates}>
          {estimates.map(([key, value]) => (
            <div key={key}>
              <dt>{t(`stat_planner.${key}`)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.note}>
          {t('stat_planner.next.calibration', calibrationValues(plan))}
        </p>
      </div>
    </Card>
  );
};

export default NextLevelCard;
