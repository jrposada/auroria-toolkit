import { DpsModel, dpsModel } from '@shared/common/stat-planner/dps-model';
import {
  projectPlan,
  talentReachedAt,
} from '@shared/common/stat-planner/project-plan';
import { StatBlock } from '@shared/common/stat-planner/stats';
import { talentTarget } from '@shared/common/stat-planner/talent-target';
import { Class } from '@shared/models/classes/class';
import { Weapon } from '@shared/models/weapons/weapon';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import {
  DEFAULTS,
  parsePlannerForm,
  PlannerForm,
  PlannerValues,
  Slot,
  toPlannerValues,
  WEAPON_SLOTS,
} from './planner-form';

export type Plan = {
  values: PlannerValues;
  cls: Class;
  level: number;
  /** Filtered by slot type, API order kept. */
  weapons: Record<Slot, Weapon[]>;
  selected: Record<Slot, Weapon | null>;
  target: { total: number; setBy: Weapon | null; reachedAt: number | null };
  /** Index 0 is level 1. */
  totals: StatBlock[];
  current: StatBlock;
  dps: DpsModel;
};

export function computePlan(
  form: unknown,
  cls: Class,
  weapons: Weapon[]
): Plan {
  const values = toPlannerValues(parsePlannerForm(form), cls.maxLevel);
  const byType = (type: string) =>
    weapons.filter((weapon) => weapon.type === type);
  const [ls, gs] = WEAPON_SLOTS.map(({ type }) => byType(type)) as [
    Weapon[],
    Weapon[],
  ];
  // A stored id that no longer exists falls back to the default weapon.
  const pick = (group: Weapon[], id: string, defaultId: string) =>
    group.find((weapon) => weapon.id === id) ??
    group.find((weapon) => weapon.id === defaultId) ??
    null;
  const selected = {
    ls: pick(ls, values.lsId, DEFAULTS.lsId),
    gs: pick(gs, values.gsId, DEFAULTS.gsId),
  };

  const carried = [selected.ls, selected.gs].filter(
    (weapon): weapon is Weapon => weapon !== null
  );
  const target = talentTarget(cls.baseStats.tal, carried);
  const totals = projectPlan({
    baseStats: cls.baseStats,
    ratio: values.ratio,
    talentStartLevel: values.talentStartLevel,
    talentTotal: target.total,
    maxLevel: cls.maxLevel,
    pointsPerLevel: cls.pointsPerLevel,
  });

  return {
    values,
    cls,
    level: values.level,
    weapons: { ls, gs },
    selected,
    target: {
      total: target.total,
      setBy: carried.find((weapon) => weapon.id === target.setBy) ?? null,
      reachedAt: talentReachedAt(totals, target.total),
    },
    totals,
    current: totals[values.level - 1]!,
    dps: dpsModel({
      plan: totals,
      baseAgi: cls.baseStats.agi,
      test: values.test,
      selected: {
        lsAtk: selected.ls?.physicalAtk ?? null,
        gsAtk: selected.gs?.physicalAtk ?? null,
      },
    }),
  };
}

export function usePlan(
  cls: Class | undefined,
  weapons: Weapon[] | undefined
): Plan | null {
  const form = useWatch<PlannerForm>();

  return useMemo(
    () => (cls && weapons ? computePlan(form, cls, weapons) : null),
    [form, cls, weapons]
  );
}
