import { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Field from '../../ui/field/field';
import Section from '../../ui/section/section';
import { PlannerForm } from './planner-form';
import styles from './trait-order.module.css';
import { TraitPhaseStatus, traitPhaseStatuses } from './trait-phases';
import { Plan } from './use-plan';

type TraitOrderProps = {
  plan: Plan;
};

const TraitOrder: FunctionComponent<TraitOrderProps> = ({ plan }) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<PlannerForm>();

  const status = (phase: TraitPhaseStatus) =>
    phase.state === 'done'
      ? t('stat_planner.traits.done')
      : phase.state === 'part'
        ? t('stat_planner.traits.to_go', { count: phase.toGo })
        : t('stat_planner.traits.later');

  return (
    <Section
      title={t('stat_planner.traits.title')}
      actions={
        <Field
          label={t('stat_planner.traits.points_label')}
          hint={t('stat_planner.traits.points_hint')}
        >
          <input
            type="number"
            min={0}
            max={100}
            className={styles.points}
            aria-invalid={errors.traitPoints ? true : undefined}
            {...register('traitPoints', { valueAsNumber: true })}
          />
        </Field>
      }
    >
      <p className={styles.intro}>{t('stat_planner.traits.intro')}</p>
      <ol className={styles.phases}>
        {traitPhaseStatuses(plan.values.traitPoints).map((phase, index) => (
          <li key={phase.title} data-state={phase.state}>
            <span className={styles.number}>{index + 1}</span>
            <div className={styles.text}>
              <p className={styles.title}>{phase.title}</p>
              <p>{phase.nodes}</p>
              <p className={styles.description}>{phase.description}</p>
            </div>
            <div className={styles.cost}>
              <span>{t('stat_planner.traits.cost', { cost: phase.cost })}</span>
              <span>
                {t('stat_planner.traits.total', { total: phase.total })}
              </span>
              <span className={styles.status}>{status(phase)}</span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
};

export default TraitOrder;
