import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './data-state.module.css';
import { DataStatus } from './query-status';

type DataStateProps = {
  status: DataStatus;
  onRetry: () => void;
  /** Shown while loading; use Placeholder blocks of the final size. */
  placeholder: ReactNode;
  children: ReactNode;
};

const DataState: FunctionComponent<DataStateProps> = ({
  status,
  onRetry,
  placeholder,
  children,
}) => {
  const { t } = useTranslation();

  if (status === 'loading') {
    return (
      <div aria-busy="true" className={styles.loading}>
        <span className="visually-hidden">{t('data_state.loading')}</span>
        {placeholder}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className={styles.error}>
        <p>{t('data_state.error')}</p>
        <button type="button" onClick={onRetry}>
          {t('data_state.retry')}
        </button>
      </div>
    );
  }

  return children;
};

export default DataState;
