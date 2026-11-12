import { Link } from '@tanstack/react-router';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const CraftingEmptyState: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <p>{t('crafting.empty')}</p>
      <p>
        <Link to="/stat-planner">{t('crafting.back')}</Link>
      </p>
    </>
  );
};

export default CraftingEmptyState;
