import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './talent-target.module.css';
import { Plan } from './use-plan';

type TalentTargetProps = {
  plan: Plan;
};

const TalentTarget: FunctionComponent<TalentTargetProps> = ({ plan }) => {
  const { t } = useTranslation();
  const { target, cls } = plan;

  return (
    <div className={styles.target}>
      <p className={styles.label}>
        {t('stat_planner.target.label', { maxLevel: cls.maxLevel })}
      </p>
      <p className={styles.value} data-talent-target>
        {target.total}
      </p>
      {target.setBy ? (
        <>
          <p className={styles.why}>
            {t('stat_planner.target.set_by', { name: target.setBy.name })}
          </p>
          <p className={styles.why}>
            {target.reachedAt === null
              ? t('stat_planner.target.not_reached', {
                  maxLevel: cls.maxLevel,
                })
              : t('stat_planner.target.reached', { level: target.reachedAt })}
          </p>
        </>
      ) : (
        <p className={styles.why}>
          {t('stat_planner.target.base', { base: cls.baseStats.tal })}
        </p>
      )}
    </div>
  );
};

export default TalentTarget;
