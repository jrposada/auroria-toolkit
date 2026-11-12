import { availablePoints } from '@shared/common/build/allocate';
import { derivedStats } from '@shared/common/build/derive';
import { ATTRIBUTE_KEYS, AttributeKey } from '@shared/common/build/stats';

import { Slot } from './planner-form';
import { Plan, PlannerDps } from './use-plan';

export type StatTone = 'strength' | 'constitution' | 'talent' | 'fixed';

const TONES: Record<AttributeKey, StatTone> = {
  str: 'strength',
  agi: 'fixed',
  con: 'constitution',
  int: 'fixed',
  tal: 'talent',
  end: 'fixed',
};

export type StatRow = {
  key: AttributeKey;
  tone: StatTone;
  base: number;
  spent: number;
  total: number;
  barPct: number;
};

/** Bars are scaled to the largest total at the last level. */
export function statRows(plan: Plan): StatRow[] {
  const last = plan.totals.at(-1) ?? plan.current;
  const maxTotal = Math.max(...ATTRIBUTE_KEYS.map((key) => last[key]));

  return ATTRIBUTE_KEYS.map((key) => {
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
  const spent = ATTRIBUTE_KEYS.reduce(
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
  const derivation = plan.cls.derivation;
  const derived = derivedStats(
    plan.current,
    derivation,
    derivation.reference.gear
  );

  return {
    attack: derived.attack.toFixed(0),
    critChance: `${derived.critPct.toFixed(1)}%`,
    critDamageRating: String(Math.round(derived.critDamageRating)),
    penetration: derived.penetration.toFixed(1),
  };
}

export function calibrationValues(
  plan: Plan
): Record<
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
  const { reference, perPoint, critRatingDivisor } = plan.cls.derivation;
  const atCalibration = derivedStats(
    {
      str: reference.attributes.str ?? 0,
      agi: reference.attributes.agi ?? 0,
      con: 0,
      int: 0,
      tal: 0,
      end: 0,
    },
    plan.cls.derivation,
    reference.gear
  );

  return {
    str: String(reference.attributes.str),
    agi: String(reference.attributes.agi),
    attack: String(reference.values.attack),
    critRating: String(reference.values.critRating),
    critPct: atCalibration.critPct.toFixed(1),
    critDamage: String(reference.values.critDamageRating),
    pen: String(reference.values.penetration),
    attackPerStr: String(perPoint.attack?.str),
    penPerStr: String(perPoint.penetration?.str),
    divisor: critRatingDivisor.toLocaleString('en-US'),
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

function dpsSide(dps: number, attack: number, attackPerStr: number): DpsSide {
  return {
    dps: dps.toFixed(0),
    attack: attack.toFixed(0),
    perStrength:
      attack > 0 ? `+${((attackPerStr * 100) / attack).toFixed(2)}%` : '–',
  };
}

export function dpsView(plan: Plan): DpsView {
  if (!plan.dps.ok) {
    return { ok: false };
  }

  const at = plan.dps.at(plan.level);
  const attackPerStr = plan.cls.derivation.perPoint.attack?.str ?? 0;

  return {
    ok: true,
    verdict: dpsVerdict(at.ls, at.gs),
    ls: dpsSide(at.ls, at.lsAtk, attackPerStr),
    gs: dpsSide(at.gs, at.gsAtk, attackPerStr),
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
  const points: ReturnType<PlannerDps['at']>[] = plan.totals.map((_, index) =>
    plan.dps.at(index + 1)
  );
  const ls = points.map((point) => point.ls);
  const gs = points.map((point) => point.gs);
  const max = Math.max(0, ...ls, ...gs);

  return { ls, gs, step: max > 400 ? 100 : max > 150 ? 50 : 25 };
}
