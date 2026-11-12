import z from 'zod';

import { Weapon } from '../../models/weapons/weapon.ts';
import {
  ATTRIBUTE_KEYS,
  AttributeBlock,
  AttributeKey,
  RandomStat,
  STAT_IDS,
  StatId,
  StatModifier,
} from './stats.ts';

export const GEAR_SLOTS = [
  'main',
  'swap',
  'helmet',
  'chest',
  'gloves',
  'shoes',
  'necklace',
  'earrings',
  'ring',
  'bracelets',
] as const;
export const gearSlotSchema = z.enum(GEAR_SLOTS);
export type GearSlot = z.infer<typeof gearSlotSchema>;

const modifierStatSchema = z.enum([...ATTRIBUTE_KEYS, ...STAT_IDS]);

export const gearPieceSchema = z.object({
  itemId: z.string(),
  enhancement: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(5),
    z.literal(10),
    z.literal(15),
  ]),
  lunagemId: z.string().nullable(),
  /** The one roll option the piece rolled; null until it is set. */
  rolled: modifierStatSchema.nullable(),
  pinned: z.record(modifierStatSchema, z.number().finite()),
});
export type GearPiece = z.infer<typeof gearPieceSchema>;

export type GearSlotKind =
  | 'weapon'
  | 'helmet'
  | 'chest'
  | 'gloves'
  | 'shoes'
  | 'necklace'
  | 'earrings'
  | 'ring'
  | 'bracelets';

/** The calculation-facing item shape; piece C's models map onto it. */
export type GearItem = {
  id: string;
  /** null: any class can wear it (armor and jewelry only). */
  class: string | null;
  slotKind: GearSlotKind;
  weaponType: string | null;
  talentRequirement: number | null;
  baseStats: StatModifier[];
  lunastone: RandomStat | null;
  rollOptions: RandomStat[];
  tempering: { level: 1 | 5 | 10 | 15; bonusPct: number }[];
};

export type Lunagem = { id: string; stats: StatModifier[] };

export type GearCatalog = { items: GearItem[]; lunagems: Lunagem[] };

export type GearSet = {
  classId: string;
  gear: Partial<Record<GearSlot, GearPiece>>;
};

export type StatRange = { min: number; max: number; value: number };

export type GearBonuses = {
  attributes: AttributeBlock;
  stats: Record<StatId, StatRange>;
  missing: string[];
};

type Hand = 'main' | 'swap';

export function fitsSlot(
  item: GearItem,
  slot: GearSlot,
  classId: string
): boolean {
  if (slot === 'main' || slot === 'swap') {
    return item.slotKind === 'weapon' && item.class === classId;
  }

  return (
    item.slotKind === slot && (item.class === null || item.class === classId)
  );
}

export function weaponToGearItem(weapon: Weapon): GearItem {
  const baseStats: StatModifier[] = [];
  if (weapon.physicalAtk !== null) {
    baseStats.push({ stat: 'physicalAtk', value: weapon.physicalAtk });
  }
  if (weapon.magicAtk !== null) {
    baseStats.push({ stat: 'magicAtk', value: weapon.magicAtk });
  }

  return {
    id: weapon.id,
    class: weapon.class,
    slotKind: 'weapon',
    weaponType: weapon.type,
    talentRequirement: weapon.talentRequirement,
    baseStats,
    // Today's lunastone is free text; piece C restructures it.
    lunastone: null,
    rollOptions: [],
    tempering: weapon.tempering.steps.map(({ level, bonusPct }) => ({
      level,
      bonusPct,
    })),
  };
}

type Contribution = { stat: AttributeKey | StatId } & StatRange;

function pieceContributions(
  piece: GearPiece,
  item: GearItem,
  lunagem: Lunagem | null
): Contribution[] {
  const step = item.tempering.find(({ level }) => level === piece.enhancement);
  const multiplier = 1 + (step?.bonusPct ?? 0) / 100;
  const fixed = (stat: AttributeKey | StatId, value: number) => ({
    stat,
    min: value,
    max: value,
    value,
  });

  const random = new Map<AttributeKey | StatId, { min: number; max: number }>();
  const rolled = item.rollOptions.find(({ stat }) => stat === piece.rolled);
  for (const { stat, min, max } of [item.lunastone, rolled].filter(
    (randomStat) => randomStat != null
  )) {
    const range = random.get(stat) ?? { min: 0, max: 0 };
    random.set(stat, { min: range.min + min, max: range.max + max });
  }
  const pinnedValue = (
    stat: AttributeKey | StatId,
    min: number,
    max: number
  ) => {
    const pin = piece.pinned[stat];
    return pin === undefined
      ? (min + max) / 2
      : Math.min(max, Math.max(min, pin));
  };

  return [
    ...item.baseStats.map(({ stat, value }) => fixed(stat, value * multiplier)),
    ...[...random].map(([stat, { min, max }]) => ({
      stat,
      min,
      max,
      value: pinnedValue(stat, min, max),
    })),
    ...(lunagem?.stats ?? []).map(({ stat, value }) => fixed(stat, value)),
  ];
}

type Resolved = {
  slot: GearSlot;
  item: GearItem;
  contributions: Contribution[];
};

function resolve(
  set: GearSet,
  catalog: GearCatalog
): { resolved: Resolved[]; missing: string[] } {
  const resolved: Resolved[] = [];
  const missing = new Set<string>();

  for (const slot of GEAR_SLOTS) {
    const piece = set.gear[slot];
    if (!piece) continue;

    const item = catalog.items.find(({ id }) => id === piece.itemId);
    if (!item || !fitsSlot(item, slot, set.classId)) {
      missing.add(piece.itemId);
      continue;
    }

    let lunagem: Lunagem | null = null;
    if (piece.lunagemId !== null) {
      lunagem =
        catalog.lunagems.find(({ id }) => id === piece.lunagemId) ?? null;
      if (!lunagem) missing.add(piece.lunagemId);
    }

    resolved.push({
      slot,
      item,
      contributions: pieceContributions(piece, item, lunagem),
    });
  }

  return { resolved, missing: [...missing] };
}

const isAttribute = (stat: AttributeKey | StatId): stat is AttributeKey =>
  (ATTRIBUTE_KEYS as readonly string[]).includes(stat);

/** Resolved items of every equipped slot, both weapons included. */
export function equippedItems(set: GearSet, catalog: GearCatalog): GearItem[] {
  return resolve(set, catalog).resolved.map(({ item }) => item);
}

/** Only the weapon in `inHand` counts; the other hand is still checked for missing ids. */
export function gearBonuses(
  set: GearSet,
  catalog: GearCatalog,
  inHand: Hand
): GearBonuses {
  const offHand: Hand = inHand === 'main' ? 'swap' : 'main';
  const { resolved, missing } = resolve(set, catalog);
  const attributes = Object.fromEntries(
    ATTRIBUTE_KEYS.map((key) => [key, 0])
  ) as AttributeBlock;
  const stats = Object.fromEntries(
    STAT_IDS.map((stat) => [stat, { min: 0, max: 0, value: 0 }])
  ) as Record<StatId, StatRange>;

  for (const { slot, contributions } of resolved) {
    if (slot === offHand) continue;
    for (const { stat, min, max, value } of contributions) {
      if (isAttribute(stat)) {
        attributes[stat] += value;
      } else {
        stats[stat].min += min;
        stats[stat].max += max;
        stats[stat].value += value;
      }
    }
  }

  return { attributes, stats, missing };
}

/**
 * The weapon's own physical ATK, or null when the slot is empty, its item
 * doesn't resolve or publishes no ATK (dpsModel then uses the tested ATK).
 */
export function pieceAtk(
  set: GearSet,
  catalog: GearCatalog,
  slot: Hand
): number | null {
  const piece = resolve(set, catalog).resolved.find(
    (resolved) => resolved.slot === slot
  );
  if (!piece?.item.baseStats.some(({ stat }) => stat === 'physicalAtk')) {
    return null;
  }

  return piece.contributions.reduce(
    (sum, { stat, value }) => (stat === 'physicalAtk' ? sum + value : sum),
    0
  );
}
