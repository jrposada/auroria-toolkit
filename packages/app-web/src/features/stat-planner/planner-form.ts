import { DpsTest } from '@shared/common/stat-planner/dps-model';
import { PlanRatio } from '@shared/common/stat-planner/project-plan';
import z from 'zod';

export const PLANNER_STORAGE_KEY = 'auroria-stat-planner-v1';
export const PLANNER_CLASS_ID = 'warrior';
/** Only used until the class has loaded. */
export const DEFAULT_MAX_LEVEL = 40;
export const LEVEL_SHORTCUTS = [1, 10, 20, 30, 40];
export const RATIO_OPTIONS = ['3', '2', '1', '0.5'] as const;
export const WEAPON_SLOTS = [
  { slot: 'ls', type: 'Longsword', field: 'lsId' },
  { slot: 'gs', type: 'Greatsword', field: 'gsId' },
] as const;
export type Slot = 'ls' | 'gs';
export const TEST_FIELDS = [
  'lsAtk',
  'lsDmg',
  'lsSec',
  'gsAtk',
  'gsDmg',
  'gsSec',
  'testAttack',
  'testStr',
] as const;

const finite = z.number().finite();

export const plannerFormSchema = z.object({
  level: finite,
  ratio: z.enum(RATIO_OPTIONS),
  talentStartLevel: finite,
  lsId: z.string(),
  gsId: z.string(),
  lsAtk: finite,
  lsDmg: finite,
  lsSec: finite,
  gsAtk: finite,
  gsDmg: finite,
  gsSec: finite,
  testAttack: finite,
  testStr: finite,
  traitPoints: finite,
  testInputsEdited: z.boolean(),
});
export type PlannerForm = z.infer<typeof plannerFormSchema>;

export const DEFAULTS: PlannerForm = {
  level: 1,
  ratio: '2',
  talentStartLevel: 29,
  lsId: 'wrathful-tyrants-horn',
  gsId: 'scattered-mist',
  lsAtk: 41,
  lsDmg: 1200,
  lsSec: 10,
  gsAtk: 105,
  gsDmg: 1500,
  gsSec: 10,
  testAttack: 100,
  testStr: 54,
  traitPoints: 0,
  testInputsEdited: false,
};

export type PlannerValues = {
  level: number;
  ratio: PlanRatio;
  talentStartLevel: number;
  lsId: string;
  gsId: string;
  test: DpsTest;
  traitPoints: number;
  testInputsEdited: boolean;
};

/** Each field that fails the schema falls back to its default, as the reference's `num()` does. */
export function parsePlannerForm(raw: unknown): PlannerForm {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ...DEFAULTS };
  }

  const record = raw as Record<string, unknown>;
  const shape = plannerFormSchema.shape;
  const form: Record<string, unknown> = {};
  for (const key of Object.keys(shape) as (keyof PlannerForm)[]) {
    const parsed = shape[key].safeParse(record[key]);
    form[key] = parsed.success ? parsed.data : DEFAULTS[key];
  }

  return form as PlannerForm;
}

export function clampLevel(level: number, maxLevel: number): number {
  if (!Number.isFinite(level)) {
    return 1;
  }

  return Math.max(1, Math.min(maxLevel, Math.trunc(level)));
}

export function toPlannerValues(
  form: PlannerForm,
  maxLevel: number
): PlannerValues {
  return {
    level: clampLevel(form.level, maxLevel),
    ratio: Number(form.ratio) as PlanRatio,
    talentStartLevel: Math.max(2, Math.min(maxLevel, form.talentStartLevel)),
    lsId: form.lsId,
    gsId: form.gsId,
    test: {
      lsAtk: form.lsAtk,
      lsDmg: form.lsDmg,
      lsSec: form.lsSec,
      gsAtk: form.gsAtk,
      gsDmg: form.gsDmg,
      gsSec: form.gsSec,
      attack: form.testAttack,
      str: form.testStr,
    },
    traitPoints: Math.max(0, form.traitPoints),
    testInputsEdited: form.testInputsEdited,
  };
}
