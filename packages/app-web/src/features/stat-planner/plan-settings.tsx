import { Class } from '@shared/models/classes/class';
import { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '../../ui/button/button';
import Field from '../../ui/field/field';
import Section from '../../ui/section/section';
import styles from './plan-settings.module.css';
import { DEFAULTS, PlannerForm, RATIO_OPTIONS } from './planner-form';

type PlanSettingsProps = {
  cls: Class;
};

const PlanSettings: FunctionComponent<PlanSettingsProps> = ({ cls }) => {
  const { t } = useTranslation();
  const {
    register,
    reset,
    formState: { errors },
  } = useFormContext<PlannerForm>();

  return (
    <Section>
      <details>
        <summary className={styles.summary}>
          {t('stat_planner.settings.title')}
        </summary>
        <div className={styles.body}>
          <div className={styles.fields}>
            <Field label={t('stat_planner.settings.ratio')}>
              <select {...register('ratio')}>
                {RATIO_OPTIONS.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {t(`stat_planner.settings.ratio_${ratio}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('stat_planner.settings.talent_start')}>
              <input
                type="number"
                min={2}
                max={cls.maxLevel}
                aria-invalid={errors.talentStartLevel ? true : undefined}
                {...register('talentStartLevel', { valueAsNumber: true })}
              />
            </Field>
          </div>
          <p className={styles.hint}>
            {t('stat_planner.settings.hint', {
              className: cls.name,
              ...cls.baseStats,
              maxLevel: cls.maxLevel,
            })}
          </p>
          <div>
            <Button onClick={() => reset(DEFAULTS)}>
              {t('stat_planner.settings.reset')}
            </Button>
          </div>
        </div>
      </details>
    </Section>
  );
};

export default PlanSettings;
