import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './in-game-checks.module.css';

const CHECKS = ['sharpwake', 'talent', 'load', 'survival'] as const;

const InGameChecks: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section data-field-text className={styles.checks}>
      <h2>{t('stat_planner.checks.title')}</h2>
      <ul className={styles.list}>
        {CHECKS.map((check) => (
          <li key={check}>
            <strong>{t(`stat_planner.checks.${check}_title`)}</strong>{' '}
            {t(`stat_planner.checks.${check}_body`)}
          </li>
        ))}
      </ul>
      <p className={styles.measured}>
        {t('stat_planner.checks.measured')}{' '}
        <a href="https://archeagebuilds.com/servers/" rel="noreferrer">
          {t('stat_planner.checks.notices')}
        </a>
      </p>
    </section>
  );
};

export default InGameChecks;
