import { zodResolver } from '@hookform/resolvers/zod';
import { useGetClassById } from '@shared-react/api/classes/use-get-class-by-id';
import { useGetWeapons } from '@shared-react/api/weapons/use-get-weapons';
import { FunctionComponent, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  getLocalStorage,
  readStoredValue,
  writeStoredValue,
} from '../../core/hooks/use-local-storage/use-local-storage';
import { useMediaQuery } from '../../core/hooks/use-media-query/use-media-query';
import DataState from '../../ui/data-state/data-state';
import Placeholder from '../../ui/data-state/placeholder';
import { combineQueryStatus } from '../../ui/data-state/query-status';
import Section from '../../ui/section/section';
import DpsSection from './dps-section';
import InGameChecks from './in-game-checks';
import LevelBar from './level-bar';
import NextLevelCard from './next-level-card';
import PlanSettings from './plan-settings';
import styles from './planner.module.css';
import {
  DEFAULT_MAX_LEVEL,
  parsePlannerForm,
  PLANNER_CLASS_ID,
  PLANNER_STORAGE_KEY,
  PlannerForm,
  plannerFormSchema,
} from './planner-form';
import StatsCard from './stats-card';
import TalentTarget from './talent-target';
import TotalsChart from './totals-chart';
import TraitOrder from './trait-order';
import { usePlan } from './use-plan';
import WeaponPicker from './weapon-picker';

// Measured desktop heights of the panels that need game data, so loading
// does not shift the page.
const PLACEHOLDER_HEIGHTS = [509, 382, 453, 705, 216, 68, 888, 285];

const PlannerContent: FunctionComponent = () => {
  const { t } = useTranslation();
  const classQuery = useGetClassById({ id: PLANNER_CLASS_ID });
  const weaponsQuery = useGetWeapons({ class: PLANNER_CLASS_ID });
  const plan = usePlan(classQuery.data, weaponsQuery.data);
  const values = useWatch<PlannerForm>();
  const coarse = useMediaQuery('(hover: none)');
  const cls = classQuery.data;

  useEffect(() => {
    writeStoredValue(getLocalStorage(), PLANNER_STORAGE_KEY, values);
  }, [values]);

  const retry = () => {
    classQuery.refetch();
    weaponsQuery.refetch();
  };

  return (
    <div className={styles.planner}>
      <ul data-intro className={styles.intro}>
        <li>{t('stat_planner.intro.game')}</li>
        {cls && (
          <>
            <li>{t('stat_planner.intro.base', { className: cls.name })}</li>
            <li>
              {t('stat_planner.intro.points', { count: cls.pointsPerLevel })}
            </li>
          </>
        )}
        <li>{t('stat_planner.intro.weapons')}</li>
      </ul>

      <LevelBar maxLevel={cls?.maxLevel ?? DEFAULT_MAX_LEVEL} />

      <DataState
        status={combineQueryStatus([classQuery, weaponsQuery])}
        onRetry={retry}
        placeholder={PLACEHOLDER_HEIGHTS.map((height, index) => (
          <Placeholder key={index} height={height} />
        ))}
      >
        {plan && (
          <>
            <Section>
              <div className={styles.weapons}>
                <WeaponPicker slot="ls" plan={plan} />
                <WeaponPicker slot="gs" plan={plan} />
                <TalentTarget plan={plan} />
              </div>
              <div className={styles.weaponNotes}>
                <p>
                  {coarse
                    ? t('stat_planner.weapons.how_touch')
                    : t('stat_planner.weapons.how_hover')}
                </p>
                <p>{t('stat_planner.weapons.note')}</p>
              </div>
            </Section>
            <div className={styles.summary}>
              <StatsCard plan={plan} />
              <NextLevelCard plan={plan} />
            </div>
            <TotalsChart plan={plan} />
            <DpsSection plan={plan} />
            <PlanSettings cls={plan.cls} />
            <TraitOrder plan={plan} />
            <InGameChecks />
          </>
        )}
      </DataState>
    </div>
  );
};

type PlannerProps = {
  initialForm?: PlannerForm;
};

const Planner: FunctionComponent<PlannerProps> = ({ initialForm }) => {
  const [defaultValues] = useState(
    () =>
      initialForm ??
      parsePlannerForm(
        readStoredValue(getLocalStorage(), PLANNER_STORAGE_KEY, null)
      )
  );
  const methods = useForm<PlannerForm>({
    defaultValues,
    resolver: zodResolver(plannerFormSchema),
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <PlannerContent />
    </FormProvider>
  );
};

export default Planner;
