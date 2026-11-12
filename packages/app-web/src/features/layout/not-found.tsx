import { Link } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const NotFound: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('not_found.title')}</h1>
      <p>
        <Link to="/stat-planner">{t('not_found.back')}</Link>
      </p>
    </>
  );
};

export default NotFound;
