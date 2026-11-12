import { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '../../ui/card/card';
import Chip from '../../ui/chip/chip';
import Field from '../../ui/field/field';
import LineChart from '../../ui/line-chart/line-chart';
import styles from './dps-section.module.css';
import {
  calibrationValues,
  dpsSeries,
  dpsView,
  projection,
  Verdict,
} from './plan-view';
import {
  LEVEL_SHORTCUTS,
  PlannerForm,
  Slot,
  TEST_FIELDS,
} from './planner-form';
import { Plan } from './use-plan';

type DpsSectionProps = {
  plan: Plan;
};

type TestField = (typeof TEST_FIELDS)[number];

const SLOTS: Slot[] = ['ls', 'gs'];
const STEPS = [1, 2, 3, 4] as const;

const DpsSection: FunctionComponent<DpsSectionProps> = ({ plan }) => {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PlannerForm>();
  const view = dpsView(plan);
  const maxLevel = plan.cls.maxLevel;

  const numberInput = (name: TestField, min: number, step?: number) => (
    <input
      type="number"
      min={min}
      step={step}
      aria-invalid={errors[name] ? true : undefined}
      {...register(name, {
        valueAsNumber: true,
        onChange: () => setValue('testInputsEdited', true),
      })}
    />
  );

  const projectionText = (slot: Slot) => {
    const projected = projection(plan, slot);

    return projected.kind === 'selected'
      ? t('stat_planner.dps.projected', {
          name: projected.name,
          atk: projected.atk,
        })
      : t(`stat_planner.dps.projected_tested_${slot}`, {
          name: projected.name ?? t('stat_planner.dps.selected'),
        });
  };

  const verdictText = (verdict: Verdict) =>
    verdict.kind === 'even'
      ? t('stat_planner.dps.even')
      : t(`stat_planner.dps.ahead_${verdict.slot}`, { pct: verdict.pct });

  const series = view.ok ? dpsSeries(plan) : null;

  return (
    <>
      <Card
        title={t('stat_planner.dps.title', { level: plan.level })}
        aside={
          plan.values.testInputsEdited ? undefined : (
            <Chip variant="talent">{t('stat_planner.dps.example')}</Chip>
          )
        }
      >
        <p className={styles.hint}>{t('stat_planner.dps.hint')}</p>

        <div className={styles.grid}>
          {SLOTS.map((slot) => (
            <div key={slot} className={styles.inputs} data-slot={slot}>
              <h3>{t(`stat_planner.weapons.${slot}`)}</h3>
              <Field label={t('stat_planner.dps.tested_atk')}>
                {numberInput(`${slot}Atk`, 0)}
              </Field>
              <Field label={t('stat_planner.dps.test_damage')}>
                {numberInput(`${slot}Dmg`, 0)}
              </Field>
              <Field label={t('stat_planner.dps.test_seconds')}>
                {numberInput(`${slot}Sec`, 0.1, 0.1)}
              </Field>
              <p className={styles.hint}>{projectionText(slot)}</p>
            </div>
          ))}

          <div className={styles.output}>
            <div className={styles.tiles}>
              {SLOTS.map((slot) => (
                <div
                  key={slot}
                  className={styles.tile}
                  data-dps-tile
                  data-slot={slot}
                >
                  <span className={styles.tileLabel}>
                    {t(`stat_planner.dps.dps_${slot}`)}
                  </span>
                  <span className={styles.tileValue}>
                    {view.ok ? view[slot].dps : '–'}
                  </span>
                  {view.ok && (
                    <span className={styles.tileAttack}>
                      {t('stat_planner.dps.attack', {
                        attack: view[slot].attack,
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.verdict} data-verdict>
              {view.ok
                ? verdictText(view.verdict)
                : t('stat_planner.dps.invalid')}
            </p>
            <dl className={styles.perStrength}>
              {SLOTS.map((slot) => (
                <div key={slot}>
                  <dt>{t(`stat_planner.dps.per_str_${slot}`)}</dt>
                  <dd>{view.ok ? view[slot].perStrength : '–'}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.testFields}>
              <Field label={t('stat_planner.dps.test_attack')}>
                {numberInput('testAttack', 0)}
              </Field>
              <Field label={t('stat_planner.dps.test_str')}>
                {numberInput('testStr', 0)}
              </Field>
            </div>
          </div>
        </div>

        {series && (
          <div className={styles.chart}>
            <LineChart
              ariaLabel={t('stat_planner.dps.chart_aria')}
              series={[
                {
                  id: 'ls',
                  label: t('stat_planner.weapons.ls'),
                  color: 'var(--sea)',
                  values: series.ls,
                },
                {
                  id: 'gs',
                  label: t('stat_planner.weapons.gs'),
                  color: 'var(--ink)',
                  values: series.gs,
                },
              ]}
              xTicks={LEVEL_SHORTCUTS.filter((level) => level <= maxLevel)}
              yStep={series.step}
              markerX={plan.level}
              height={220}
              endLabelSpace={112}
              caption={t('stat_planner.dps.chart_caption')}
              markerTitle={(line, value) =>
                t('stat_planner.dps.marker_title', {
                  label: line.label,
                  value: Math.round(value),
                  level: plan.level,
                })
              }
            />
          </div>
        )}
      </Card>

      <section data-field-text className={styles.fieldText}>
        <div>
          <h3>{t('stat_planner.dps.how_title')}</h3>
          <p>
            {t('stat_planner.dps.how_body', {
              attackPerStr: calibrationValues().attackPerStr,
            })}
          </p>
        </div>
        <div>
          <h3>{t('stat_planner.dps.test_title')}</h3>
          <ol>
            {STEPS.map((step) => (
              <li key={step}>{t(`stat_planner.dps.test_step_${step}`)}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
};

export default DpsSection;
