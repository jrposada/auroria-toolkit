import { createFileRoute } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import Planner from '../features/stat-planner/planner';

const StatPlanner: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('stat_planner.title')}</h1>
      <Planner />
    </>
  );
};

export const Route = createFileRoute('/stat-planner')({
  component: StatPlanner,
});
