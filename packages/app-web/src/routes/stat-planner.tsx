import { createFileRoute } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const StatPlanner: FunctionComponent = () => {
  const { t } = useTranslation();

  return <h1>{t('stat_planner.title')}</h1>;
};

export const Route = createFileRoute('/stat-planner')({
  component: StatPlanner,
});
