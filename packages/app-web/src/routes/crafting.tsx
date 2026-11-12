import { useGetRecipes } from '@shared-react/api/recipes/use-get-recipes';
import { createFileRoute } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import CraftingEmptyState from '../features/crafting/crafting-empty-state';
import DataState from '../ui/data-state/data-state';
import Placeholder from '../ui/data-state/placeholder';
import { combineQueryStatus } from '../ui/data-state/query-status';

const Crafting: FunctionComponent = () => {
  const { t } = useTranslation();
  const recipesQuery = useGetRecipes();

  return (
    <>
      <h1>{t('crafting.title')}</h1>
      <DataState
        status={combineQueryStatus([recipesQuery])}
        onRetry={() => recipesQuery.refetch()}
        placeholder={<Placeholder height={64} />}
      >
        {recipesQuery.data?.length ? (
          <p>
            {t('crafting.placeholder', { count: recipesQuery.data.length })}
          </p>
        ) : (
          <CraftingEmptyState />
        )}
      </DataState>
    </>
  );
};

export const Route = createFileRoute('/crafting')({
  component: Crafting,
});
