import { Link } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app-header.module.css';
import ThemeToggle from './theme-toggle';
import ToolNav from './tool-nav';

const AppHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <Link to="/" activeOptions={{ exact: true }} className={styles.name}>
        {t('app.name')}
      </Link>
      <ToolNav />
      <div className={styles.toggle}>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default AppHeader;
