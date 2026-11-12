import { useGetClassById } from '@shared-react/api/classes/use-get-class-by-id';
import { useGetWeapons } from '@shared-react/api/weapons/use-get-weapons';
import { createFileRoute } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import DataState from '../ui/data-state/data-state';
import Placeholder from '../ui/data-state/placeholder';
import { combineQueryStatus } from '../ui/data-state/query-status';

const StatPlanner: FunctionComponent = () => {
  const { t } = useTranslation();
  const classQuery = useGetClassById({ id: 'warrior' });
  const weaponsQuery = useGetWeapons({ class: 'warrior' });

  const retry = () => {
    classQuery.refetch();
    weaponsQuery.refetch();
  };

  return (
    <>
      <h1>{t('stat_planner.title')}</h1>
      <DataState
        status={combineQueryStatus([classQuery, weaponsQuery])}
        onRetry={retry}
        placeholder={<Placeholder height={160} />}
      >
        <p>
          {t('stat_planner.placeholder', {
            className: classQuery.data?.name,
            count: weaponsQuery.data?.length,
          })}
        </p>
      </DataState>
    </>
  );
};

export const Route = createFileRoute('/stat-planner')({
  component: StatPlanner,
});
