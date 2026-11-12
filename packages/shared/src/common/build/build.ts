import z from 'zod';

import { Class, slugSchema } from '../../models/classes/class.ts';
import {
  PlanRatio,
  projectPlan,
  talentReachedAt,
  talentTarget,
} from './allocate.ts';
import { DerivedStats, derivedStats } from './derive.ts';
import { DpsAtLevel, dpsModel, DpsTest } from './dps.ts';
import {
  equippedItems,
  fitsSlot,
  GearBonuses,
  gearBonuses,
  GearCatalog,
  gearPieceSchema,
  GearSet,
  GearSlot,
  gearSlotSchema,
  pieceAtk,
} from './gear.ts';
import { ATTRIBUTE_KEYS, AttributeBlock, STAT_IDS } from './stats.ts';

export const BUILD_STORAGE_KEY = 'auroria-build-v1';

export const BUILD_RATIOS = ['3', '2', '1', '0.5'] as const;

const finite = z.number().finite();

const dpsWeaponTestSchema = z.object({
  weaponAtk: finite,
  damage: finite,
  seconds: finite,
});

export const dpsTestSchema = z.object({
  attack: finite,
  attributes: z
    .object({
      str: finite,
      agi: finite,
      con: finite,
      int: finite,
      tal: finite,
      end: finite,
    })
    .partial()
    .strict(),
  main: dpsWeaponTestSchema,
  swap: dpsWeaponTestSchema,
}) satisfies z.ZodType<DpsTest>;

export const buildSchema = z.object({
  version: z.literal(1),
  name: z.string(),
  classId: slugSchema,
  level: z.number().int().positive(),
  allocation: z.object({
    ratio: z.enum(BUILD_RATIOS),
    talentStartLevel: z.number().int(),
  }),
  gear: z.record(gearSlotSchema, gearPieceSchema),
  candidate: z
    .object({ slot: gearSlotSchema, piece: gearPieceSchema })
    .nullable(),
  dpsTest: dpsTestSchema,
});
export type Build = z.infer<typeof buildSchema>;

/** Defaults copied from the interim planner's DEFAULTS (app-web planner-form.ts). */
export function newBuild(cls: Pick<Class, 'id' | 'name'>): Build {
  return {
    version: 1,
    name: `New ${cls.name} build`,
    classId: cls.id,
    level: 1,
    allocation: { ratio: '2', talentStartLevel: 29 },
    gear: {},
    candidate: null,
    dpsTest: {
      attack: 100,
      attributes: { str: 54 },
      main: { weaponAtk: 41, damage: 1200, seconds: 10 },
      swap: { weaponAtk: 105, damage: 1500, seconds: 10 },
    },
  };
}

// TextEncoder + btoa/atob exist in browsers and in Node, so no Buffer.
export function encodeBuild(build: Build): string {
  const bytes = new TextEncoder().encode(JSON.stringify(build));
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export type DecodedBuild = { ok: true; build: Build } | { ok: false };

export function decodeBuild(
  text: string,
  classIds: readonly string[]
): DecodedBuild {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(text)) {
      return { ok: false };
    }

    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const parsed = buildSchema.safeParse(JSON.parse(json));
    if (!parsed.success || !classIds.includes(parsed.data.classId)) {
      return { ok: false };
    }

    return { ok: true, build: parsed.data };
  } catch {
    return { ok: false };
  }
}

export type BuildSnapshot = {
  /** build.level clamped to the class. */
  level: number;
  /** Allocation only, no gear; index 0 is level 1. */
  totals: AttributeBlock[];
  /** Totals at `level` plus the gear with the main weapon in hand. */
  attributes: AttributeBlock;
  derived: DerivedStats;
  /** Main weapon in hand. */
  gear: GearBonuses;
  dps: { ok: boolean; at(level: number): DpsAtLevel };
  talent: { total: number; setBy: string | null; reachedAt: number | null };
  missing: string[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const plus = (a: AttributeBlock, b: AttributeBlock): AttributeBlock =>
  Object.fromEntries(
    ATTRIBUTE_KEYS.map((key) => [key, a[key] + b[key]])
  ) as AttributeBlock;

/** Physical ATK of everything but the weapons, which enter DPS as weaponAtk. */
function otherAtk(set: GearSet, catalog: GearCatalog): number {
  const gear = Object.fromEntries(
    Object.entries(set.gear).filter(
      ([slot]) => slot !== 'main' && slot !== 'swap'
    )
  );

  return gearBonuses({ classId: set.classId, gear }, catalog, 'main').stats
    .physicalAtk.value;
}

/** `testGear` is the gear the DPS test was read with, main weapon in hand. */
function snapshot(
  build: Build,
  cls: Class,
  catalog: GearCatalog,
  testGear: Build['gear']
): BuildSnapshot {
  if (build.classId !== cls.id) {
    throw new Error(`Build is for ${build.classId}, not ${cls.id}`);
  }

  const level = clamp(build.level, 1, cls.maxLevel);
  const main = gearBonuses(build, catalog, 'main');
  const swap = gearBonuses(build, catalog, 'swap');

  const target = talentTarget(cls.baseStats.tal, equippedItems(build, catalog));
  const totals = projectPlan({
    baseStats: cls.baseStats,
    allocation: cls.allocation,
    ratio: Number(build.allocation.ratio) as PlanRatio,
    talentStartLevel: clamp(build.allocation.talentStartLevel, 2, cls.maxLevel),
    talentTotal: target.total,
    maxLevel: cls.maxLevel,
    pointsPerLevel: cls.pointsPerLevel,
  });

  const attributes = plus(totals[level - 1]!, main.attributes);
  const derived = derivedStats(
    attributes,
    cls.derivation,
    STAT_IDS.map((stat) => ({ stat, value: main.stats[stat].value }))
  );

  const testSet = { classId: build.classId, gear: testGear };
  const dpsInput = {
    base: plus(cls.baseStats, gearBonuses(testSet, catalog, 'main').attributes),
    derivation: cls.derivation,
    test: build.dpsTest,
    weaponAtk: {
      main: pieceAtk(build, catalog, 'main'),
      swap: pieceAtk(build, catalog, 'swap'),
    },
    gearAtkDelta: otherAtk(build, catalog) - otherAtk(testSet, catalog),
  };
  const mainModel = dpsModel({
    ...dpsInput,
    plan: totals.map((at) => plus(at, main.attributes)),
  });
  const swapModel = dpsModel({
    ...dpsInput,
    plan: totals.map((at) => plus(at, swap.attributes)),
  });

  const missing = new Set(main.missing);
  if (build.candidate) {
    const { slot, piece } = build.candidate;
    for (const id of gearBonuses(
      { classId: build.classId, gear: { [slot]: piece } },
      catalog,
      'main'
    ).missing) {
      missing.add(id);
    }
  }

  return {
    level,
    totals,
    attributes,
    derived,
    gear: main,
    dps: {
      ok: mainModel.ok && swapModel.ok,
      at(dpsLevel) {
        const inMain = mainModel.at(dpsLevel);
        const inSwap = swapModel.at(dpsLevel);
        return {
          mainAtk: inMain.mainAtk,
          swapAtk: inSwap.swapAtk,
          main: inMain.main,
          swap: inSwap.swap,
        };
      },
    },
    talent: {
      total: target.total,
      setBy: target.setBy,
      reachedAt: talentReachedAt(totals, target.total),
    },
    missing: [...missing],
  };
}

export function computeBuild(
  build: Build,
  cls: Class,
  catalog: GearCatalog
): BuildSnapshot {
  return snapshot(build, cls, catalog, build.gear);
}

export type CandidateDelta = {
  slot: GearSlot;
  attributes: AttributeBlock;
  derived: DerivedStats;
  dps: DpsAtLevel;
};

const minus = <T extends Record<string, number>>(a: T, b: T): T =>
  Object.fromEntries(
    Object.keys(a).map((key) => [key, a[key]! - b[key]!])
  ) as T;

/** Candidate equipped minus the current build, at the build's level. */
export function compareCandidate(
  build: Build,
  cls: Class,
  catalog: GearCatalog
): CandidateDelta | null {
  if (!build.candidate) {
    return null;
  }

  const { slot, piece } = build.candidate;
  const item = catalog.items.find(({ id }) => id === piece.itemId);
  if (!item || !fitsSlot(item, slot, build.classId)) {
    return null;
  }

  const current = snapshot(build, cls, catalog, build.gear);
  // The DPS test stays the one read with the current gear.
  const next = snapshot(
    { ...build, gear: { ...build.gear, [slot]: piece }, candidate: null },
    cls,
    catalog,
    build.gear
  );

  return {
    slot,
    attributes: minus(next.attributes, current.attributes),
    derived: minus(next.derived, current.derived),
    dps: minus(next.dps.at(current.level), current.dps.at(current.level)),
  };
}
