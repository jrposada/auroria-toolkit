import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalStorage } from '../../core/hooks/use-local-storage/use-local-storage';
import { useMediaQuery } from '../../core/hooks/use-media-query/use-media-query';
import Button from '../../ui/button/button';
import Segmented from '../../ui/segmented/segmented';
import {
  applyThemeChoice,
  nextThemeChoice,
  parseThemeChoice,
  THEME_CHOICES,
  THEME_STORAGE_KEY,
  ThemeChoice,
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
  const narrow = useMediaQuery('(max-width: 639.98px)');

  useEffect(() => {
    applyThemeChoice(document.documentElement, choice);
  }, [choice]);

  if (!narrow) {
    return (
      <Segmented<ThemeChoice>
        label={t('theme.label')}
        options={THEME_CHOICES.map((value) => ({
          value,
          label: t(`theme.${value}`),
        }))}
        value={choice}
        onChange={setStored}
      />
    );
  }

  return (
    <Button
      variant="quiet"
      size="sm"
      aria-label={t('theme.switch', {
        current: t(`theme.${choice}`),
        next: t(`theme.${next}`),
      })}
      onClick={() => setStored(next)}
    >
      <span className={styles.label}>{t('theme.label')}</span>
      <span className={styles.choice}>{t(`theme.${choice}`)}</span>
    </Button>
  );
};

export default ThemeToggle;
