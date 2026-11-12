import { availablePoints } from '@shared/common/stat-planner/available-points';
import {
  CALIBRATION,
  COEFFICIENTS,
} from '@shared/common/stat-planner/calibration';
import { derivedStats } from '@shared/common/stat-planner/derived-stats';
import { DpsAtLevel } from '@shared/common/stat-planner/dps-model';
import { STAT_KEYS, StatKey } from '@shared/common/stat-planner/stats';

import { Slot } from './planner-form';
import { Plan } from './use-plan';

export type StatTone = 'strength' | 'constitution' | 'talent' | 'fixed';

const TONES: Record<StatKey, StatTone> = {
  str: 'strength',
  agi: 'fixed',
  con: 'constitution',
  int: 'fixed',
  tal: 'talent',
  end: 'fixed',
};

export type StatRow = {
  key: StatKey;
  tone: StatTone;
  base: number;
  spent: number;
  total: number;
  barPct: number;
};

/** Bars are scaled to the largest total at the last level. */
export function statRows(plan: Plan): StatRow[] {
  const last = plan.totals.at(-1) ?? plan.current;
  const maxTotal = Math.max(...STAT_KEYS.map((key) => last[key]));

  return STAT_KEYS.map((key) => {
    const base = plan.cls.baseStats[key];
    const total = plan.current[key];

    return {
      key,
      tone: TONES[key],
      base,
      spent: total - base,
      total,
      barPct: Math.max(2, Math.round((total / maxTotal) * 100)),
    };
  });
}

export function pointsSpent(plan: Plan): { spent: number; available: number } {
  const spent = STAT_KEYS.reduce(
    (sum, key) => sum + plan.current[key] - plan.cls.baseStats[key],
    0
  );

  return {
    spent,
    available: availablePoints(plan.level, plan.cls.pointsPerLevel),
  };
}

export type NextLevel =
  | { kind: 'max'; level: number; points: number }
  | {
      kind: 'next';
      from: number;
      to: number;
      gains: { key: 'str' | 'con' | 'tal'; amount: number }[];
      talentUp: boolean;
    };

export function nextLevel(plan: Plan): NextLevel {
  const next = plan.totals[plan.level];

  if (!next) {
    return {
      kind: 'max',
      level: plan.level,
      points: availablePoints(plan.level, plan.cls.pointsPerLevel),
    };
  }

  const gains = (['str', 'con', 'tal'] as const)
    .map((key) => ({ key, amount: next[key] - plan.current[key] }))
    .filter((gain) => gain.amount !== 0);

  return {
    kind: 'next',
    from: plan.level,
    to: plan.level + 1,
    gains,
    talentUp: next.tal > plan.current.tal,
  };
}

export function derivedView(plan: Plan): {
  attack: string;
  critChance: string;
  critDamageRating: string;
  penetration: string;
} {
  const derived = derivedStats(plan.current);

  return {
    attack: derived.attack.toFixed(0),
    critChance: `${derived.critPct.toFixed(1)}%`,
    critDamageRating: String(Math.round(derived.critDamageRating)),
    penetration: derived.penetration.toFixed(1),
  };
}

export function calibrationValues(): Record<
  | 'str'
  | 'agi'
  | 'attack'
  | 'critRating'
  | 'critPct'
  | 'critDamage'
  | 'pen'
  | 'attackPerStr'
  | 'penPerStr'
  | 'divisor',
  string
> {
  const atCalibration = derivedStats({
    str: CALIBRATION.str,
    agi: CALIBRATION.agi,
    con: 0,
    int: 0,
    tal: 0,
    end: 0,
  });

  return {
    str: String(CALIBRATION.str),
    agi: String(CALIBRATION.agi),
    attack: String(CALIBRATION.attack),
    critRating: String(CALIBRATION.critRating),
    critPct: atCalibration.critPct.toFixed(1),
    critDamage: String(CALIBRATION.critDamageRating),
    pen: String(CALIBRATION.penetration),
    attackPerStr: String(COEFFICIENTS.attackPerStr),
    penPerStr: String(COEFFICIENTS.penetrationPerStr),
    divisor: COEFFICIENTS.critRatingDivisor.toLocaleString('en-US'),
  };
}

export type Verdict =
  | { kind: 'even' }
  | { kind: 'ahead'; slot: Slot; pct: string };

/** Under 2% either way reads as about even, as in the reference. */
export function dpsVerdict(ls: number, gs: number): Verdict {
  const diff = ls > 0 ? (gs / ls - 1) * 100 : 0;

  if (Math.abs(diff) < 2) {
    return { kind: 'even' };
  }

  return {
    kind: 'ahead',
    slot: diff > 0 ? 'gs' : 'ls',
    pct: Math.abs(diff).toFixed(0),
  };
}

type DpsSide = { dps: string; attack: string; perStrength: string };

export type DpsView =
  | { ok: false }
  | { ok: true; verdict: Verdict; ls: DpsSide; gs: DpsSide };

function dpsSide(dps: number, attack: number): DpsSide {
  return {
    dps: dps.toFixed(0),
    attack: attack.toFixed(0),
    perStrength:
      attack > 0
        ? `+${((COEFFICIENTS.attackPerStr * 100) / attack).toFixed(2)}%`
        : '–',
  };
}

export function dpsView(plan: Plan): DpsView {
  if (!plan.dps.ok) {
    return { ok: false };
  }

  const at = plan.dps.at(plan.level);

  return {
    ok: true,
    verdict: dpsVerdict(at.ls, at.gs),
    ls: dpsSide(at.ls, at.lsAtk),
    gs: dpsSide(at.gs, at.gsAtk),
  };
}

export type Projection =
  | { kind: 'selected'; name: string; atk: number }
  | { kind: 'tested'; name: string | null };

export function projection(plan: Plan, slot: Slot): Projection {
  const weapon = plan.selected[slot];

  return weapon?.physicalAtk
    ? { kind: 'selected', name: weapon.name, atk: weapon.physicalAtk }
    : { kind: 'tested', name: weapon?.name ?? null };
}

export function totalsSeries(
  plan: Plan
): Record<'str' | 'con' | 'tal', number[]> {
  return {
    str: plan.totals.map((totals) => totals.str),
    con: plan.totals.map((totals) => totals.con),
    tal: plan.totals.map((totals) => totals.tal),
  };
}

export function dpsSeries(plan: Plan): {
  ls: number[];
  gs: number[];
  step: number;
} {
  const points: DpsAtLevel[] = plan.totals.map((_, index) =>
    plan.dps.at(index + 1)
  );
  const ls = points.map((point) => point.ls);
  const gs = points.map((point) => point.gs);
  const max = Math.max(0, ...ls, ...gs);

  return { ls, gs, step: max > 400 ? 100 : max > 150 ? 50 : 25 };
}
