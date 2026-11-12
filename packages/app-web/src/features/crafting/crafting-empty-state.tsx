import { Link } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './crafting-empty-state.module.css';

const CraftingEmptyState: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.empty}>
      <p>{t('crafting.empty')}</p>
      <p>
        <Link to="/stat-planner">{t('crafting.back')}</Link>
      </p>
    </div>
  );
};

export default CraftingEmptyState;
