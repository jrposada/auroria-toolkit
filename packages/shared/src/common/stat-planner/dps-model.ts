import { COEFFICIENTS } from './calibration.ts';
import { StatBlock } from './stats.ts';

export type DpsTest = {
  lsAtk: number;
  lsDmg: number;
  lsSec: number;
  gsAtk: number;
  gsDmg: number;
  gsSec: number;
  /** Attack read with the tested Longsword equipped. */
  attack: number;
  str: number;
};

export type DpsModelInput = {
  plan: StatBlock[];
  baseAgi: number;
  test: DpsTest;
  selected: { lsAtk: number | null; gsAtk: number | null };
};

export type DpsAtLevel = {
  lsAtk: number;
  gsAtk: number;
  ls: number;
  gs: number;
};

export type DpsModel = { ok: boolean; at(level: number): DpsAtLevel };

/** Ported from `dpsModel` in docs/reference/warrior-planner.html. */
export function dpsModel({
  plan,
  baseAgi,
  test,
  selected,
}: DpsModelInput): DpsModel {
  const statPart = test.attack - test.lsAtk;
  const lsProjected = selected.lsAtk || test.lsAtk;
  const gsProjected = selected.gsAtk || test.gsAtk;
  const lsMeasured = test.lsDmg / Math.max(0.1, test.lsSec);
  const gsMeasured = test.gsDmg / Math.max(0.1, test.gsSec);
  const lsTested = statPart + test.lsAtk;
  const gsTested = statPart + test.gsAtk;

  function at(level: number): DpsAtLevel {
    const totals = plan[level - 1];
    if (!totals) {
      throw new RangeError(
        `Level ${level} is outside the plan (1-${plan.length})`
      );
    }

    const stat =
      statPart +
      COEFFICIENTS.attackPerStr * (totals.str - test.str) +
      COEFFICIENTS.attackPerAgi * (totals.agi - baseAgi);
    const lsAtk = stat + lsProjected;
    const gsAtk = stat + gsProjected;

    return {
      lsAtk,
      gsAtk,
      ls: Math.max(0, (lsMeasured * lsAtk) / lsTested),
      gs: Math.max(0, (gsMeasured * gsAtk) / gsTested),
    };
  }

  return { at, ok: statPart > 0 && lsTested > 0 && gsTested > 0 };
}
