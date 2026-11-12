import { Fragment, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app-footer.module.css';
import { CREDITS } from './credits';

const AppFooter: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <p>
        {t('footer.credits')}{' '}
        {CREDITS.map((credit, index) => (
          <Fragment key={credit.name}>
            {index > 0 && ', '}
            {credit.url ? (
              <a href={credit.url} rel="noreferrer">
                {credit.name}
              </a>
            ) : (
              credit.name
            )}
          </Fragment>
        ))}
        .
      </p>
      <p className={styles.disclaimer}>{t('footer.disclaimer')}</p>
    </footer>
  );
};

export default AppFooter;
