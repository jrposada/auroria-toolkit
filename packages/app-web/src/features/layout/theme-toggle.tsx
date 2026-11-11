import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalStorage } from '../../core/hooks/use-local-storage/use-local-storage';
import {
  applyThemeChoice,
  nextThemeChoice,
  parseThemeChoice,
  THEME_STORAGE_KEY,
} from './theme';
import styles from './theme-toggle.module.css';

const ThemeToggle: FunctionComponent = () => {
  const { t } = useTranslation();
  const [stored, setStored] = useLocalStorage<unknown>(
    THEME_STORAGE_KEY,
    'system'
  );
  const choice = parseThemeChoice(stored);
  const next = nextThemeChoice(choice);

  useEffect(() => {
    applyThemeChoice(document.documentElement, choice);
  }, [choice]);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={t('theme.switch', {
        current: t(`theme.${choice}`),
        next: t(`theme.${next}`),
      })}
      onClick={() => setStored(next)}
    >
      <span className={styles.label}>{t('theme.label')}</span>
      <span className={styles.choice}>{t(`theme.${choice}`)}</span>
    </button>
  );
};

export default ThemeToggle;
