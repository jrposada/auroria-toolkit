import { talentReachedAt } from '@shared/common/build/allocate';
import { Rarity, TemperingStep, Weapon } from '@shared/models/weapons/weapon';

import { Plan } from './use-plan';

export function rarityColor(rarity: Rarity): string {
  return `var(--r-${rarity.toLowerCase()})`;
}

export function tileView(
  weapon: Weapon,
  selectedId: string | null,
  talentNow: number
): { checked: boolean; requirement: number | null; short: boolean } {
  const requirement = weapon.talentRequirement;

  return {
    checked: weapon.id === selectedId,
    requirement,
    short: requirement !== null && talentNow < requirement,
  };
}

/** Roving tabindex: the checked tile, else the first one. */
export function tabStopId(
  weapons: Weapon[],
  selectedId: string | null
): string | null {
  return (
    weapons.find((weapon) => weapon.id === selectedId)?.id ??
    weapons[0]?.id ??
    null
  );
}

export function nextTileIndex(
  key: string,
  index: number,
  count: number
): number | null {
  if (count === 0) {
    return null;
  }

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (index + 1) % count;
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return (index + count - 1) % count;
  }

  return null;
}

/** Coarse pointers: tapping the open tile again closes its detail. */
export function tileTap(
  id: string,
  openDetailId: string | null
): string | null {
  return id === openDetailId ? null : id;
}

export function formatGold(gold: number): string {
  return gold >= 1000
    ? `${(gold / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`
    : String(gold);
}

export function formatStones(stones: { count: number; grade: string }): string {
  return `${stones.count} ${stones.grade[0]}`;
}

export type WeaponDetail = {
  color: string;
  physicalAtk: number | null;
  /** Only shown alongside Physical ATK, as in the reference. */
  magicAtk: number | null;
  /** Widths are percentages of the bar. */
  share: {
    physical: number;
    magic: number;
    physicalWidth: number;
    magicWidth: number;
  };
  stagger: number;
  exhaust: number;
  extraStat: string | null;
  weight: number;
  talent: {
    requirement: number;
    now: number;
    met: boolean;
    reachedAt: number | null;
  } | null;
  lunastone: string | null;
  tempering: {
    levels: string[];
    bonus: string[];
    stones: string[] | null;
    gold: string[] | null;
  };
  howToGet: string;
  notes: string | null;
};

// A row nobody published is dropped; a single missing cell reads as a dash.
function temperingRow<T>(
  steps: TemperingStep[],
  pick: (step: TemperingStep) => T | null,
  format: (value: T) => string
): string[] | null {
  const values = steps.map(pick);

  return values.every((value) => value === null)
    ? null
    : values.map((value) => (value === null ? '–' : format(value)));
}

export function weaponDetail(
  weapon: Weapon,
  plan: Pick<Plan, 'totals' | 'current'>
): WeaponDetail {
  const { physical, magic } = weapon.damageShare;
  const shareTotal = physical + magic;
  const requirement = weapon.talentRequirement;
  const steps = weapon.tempering.steps;

  return {
    color: rarityColor(weapon.rarity),
    physicalAtk: weapon.physicalAtk || null,
    magicAtk: weapon.physicalAtk ? weapon.magicAtk : null,
    share: {
      physical,
      magic,
      physicalWidth: shareTotal > 0 ? (physical / shareTotal) * 100 : 0,
      magicWidth: shareTotal > 0 ? (magic / shareTotal) * 100 : 0,
    },
    stagger: weapon.staggerTrigger,
    exhaust: weapon.exhaustTrigger,
    extraStat: weapon.extraStat,
    weight: weapon.weight,
    talent:
      requirement === null
        ? null
        : {
            requirement,
            now: plan.current.tal,
            met: plan.current.tal >= requirement,
            reachedAt: talentReachedAt(plan.totals, requirement),
          },
    lunastone: weapon.lunastone,
    tempering: {
      levels: steps.map((step) => `+${step.level}`),
      bonus: steps.map((step) => `+${step.bonusPct}%`),
      stones: temperingRow(steps, (step) => step.stonesPerTry, formatStones),
      gold: temperingRow(steps, (step) => step.goldPerTry, formatGold),
    },
    howToGet: weapon.howToGet,
    notes: weapon.notes,
  };
}
