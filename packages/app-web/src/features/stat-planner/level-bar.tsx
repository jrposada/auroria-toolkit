import { FunctionComponent, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '../../ui/button/button';
import StepperButton from '../../ui/stepper-button/stepper-button';
import styles from './level-bar.module.css';
import { levelKeyDelta } from './level-keys';
import { clampLevel, LEVEL_SHORTCUTS, PlannerForm } from './planner-form';

type LevelBarProps = {
  maxLevel: number;
};

const LevelBar: FunctionComponent<LevelBarProps> = ({ maxLevel }) => {
  const { t } = useTranslation();
  const { control, register, getValues, setValue } =
    useFormContext<PlannerForm>();
  const level = clampLevel(useWatch({ control, name: 'level' }), maxLevel);
  const shortcuts = LEVEL_SHORTCUTS.filter((shortcut) => shortcut <= maxLevel);

  const setLevel = (next: number) =>
    setValue('level', clampLevel(next, maxLevel));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const delta = levelKeyDelta({
        key: event.key,
        targetTag: target?.tagName ?? null,
        inTileGroup: !!target?.closest('[role="radiogroup"]'),
        modifier: event.ctrlKey || event.metaKey || event.altKey,
      });

      if (delta !== 0) {
        setValue(
          'level',
          clampLevel(clampLevel(getValues('level'), maxLevel) + delta, maxLevel)
        );
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [getValues, setValue, maxLevel]);

  return (
    <section aria-label={t('stat_planner.level.label')} className={styles.bar}>
      <div className={styles.readout}>
        <span className={styles.number}>{level}</span>
        <span className={styles.label}>{t('stat_planner.level.label')}</span>
      </div>

      <div className={styles.control}>
        <StepperButton
          label={t('stat_planner.level.down')}
          disabled={level <= 1}
          onClick={() => setLevel(level - 1)}
        >
          −
        </StepperButton>
        <div className={styles.track}>
          <input
            type="range"
            min={1}
            max={maxLevel}
            step={1}
            aria-label={t('stat_planner.level.slider')}
            {...register('level', { valueAsNumber: true })}
          />
          <div className={styles.ticks} aria-hidden="true">
            {shortcuts.map((shortcut) => (
              <span
                key={shortcut}
                style={{
                  left: `${((shortcut - 1) / Math.max(1, maxLevel - 1)) * 100}%`,
                }}
              >
                {shortcut}
              </span>
            ))}
          </div>
        </div>
        <StepperButton
          label={t('stat_planner.level.up')}
          disabled={level >= maxLevel}
          onClick={() => setLevel(level + 1)}
        >
          +
        </StepperButton>
      </div>

      <div
        role="group"
        aria-label={t('stat_planner.level.jump')}
        className={styles.jump}
      >
        {shortcuts.map((shortcut) => (
          <Button
            key={shortcut}
            size="sm"
            aria-pressed={shortcut === level}
            onClick={() => setLevel(shortcut)}
          >
            {t('stat_planner.level.shortcut', { level: shortcut })}
          </Button>
        ))}
      </div>
    </section>
  );
};

export default LevelBar;
