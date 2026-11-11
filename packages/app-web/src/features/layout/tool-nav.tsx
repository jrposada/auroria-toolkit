import { Link } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './tool-nav.module.css';
import { TOOLS } from './tools';

const ToolNav: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('nav.label')} className={styles.nav}>
      <ul className={styles.list}>
        {TOOLS.map((tool) => (
          <li key={tool.to}>
            <Link to={tool.to} className={styles.link}>
              {t(tool.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ToolNav;
