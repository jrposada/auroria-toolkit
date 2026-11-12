import { describe, expect, it } from 'vitest';

import { projectPlan, talentReachedAt } from './allocate.ts';
import {
  Build,
  BUILD_STORAGE_KEY,
  buildSchema,
  compareCandidate,
  computeBuild,
  decodeBuild,
  encodeBuild,
  newBuild,
} from './build.ts';
import { derivedStats } from './derive.ts';
import { dpsModel } from './dps.ts';
import { AttributeBlock } from './stats.ts';
import { MAGE, WARRIOR } from './test/classes.ts';
import { CATALOG, HELM, piece, SWORD } from './test/gear.ts';

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const text = (value: string) => toBase64Url(new TextEncoder().encode(value));

const warrior = (over: Partial<Build> = {}): Build => ({
  ...newBuild(WARRIOR),
  ...over,
});

const geared = warrior({
  name: 'Épée ⚔',
  gear: {
    main: {
      ...SWORD,
      enhancement: 5,
      lunagemId: 'ruby',
      pinned: { critRating: 25 },
    },
    helmet: HELM,
  },
  candidate: { slot: 'helmet', piece: { ...HELM, lunagemId: 'ruby' } },
});

describe('newBuild', () => {
  it("uses today's planner defaults", () => {
    const build = newBuild(WARRIOR);

    expect(build).toEqual({
      version: 1,
      name: 'New Warrior build',
      classId: 'warrior',
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
    });
    expect(buildSchema.parse(build)).toEqual(build);
  });

  it('stores builds under their own key', () => {
    expect(BUILD_STORAGE_KEY).toBe('auroria-build-v1');
  });
});

describe('encodeBuild / decodeBuild', () => {
  it('round-trips through a share link', () => {
    const link = encodeBuild(geared);

    expect(link).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeBuild(link, ['warrior'])).toEqual({ ok: true, build: geared });
  });

  it.each([
    ['empty', ''],
    ['non-base64url', '!!!'],
    ['standard base64', 'abc+/='],
    ['whitespace', ` ${encodeBuild(geared)}`],
    ['not JSON', text('not json')],
    ['invalid UTF-8', toBase64Url(new Uint8Array([0xff, 0xfe]))],
    ['null', text('null')],
    ['an empty object', text('{}')],
  ])('rejects %s', (_, link) => {
    expect(decodeBuild(link, ['warrior'])).toEqual({ ok: false });
  });

  it('rejects another version', () => {
    const link = text(JSON.stringify({ ...geared, version: 2 }));

    expect(decodeBuild(link, ['warrior'])).toEqual({ ok: false });
  });

  it('rejects an unknown class', () => {
    expect(decodeBuild(encodeBuild(geared), ['mage'])).toEqual({ ok: false });
  });

  it('rejects an invalid piece', () => {
    const enhancement = {
      ...geared,
      gear: { main: { ...SWORD, enhancement: 3 } },
    };
    const slot = { ...geared, gear: { offhand: SWORD } };

    expect(decodeBuild(text(JSON.stringify(enhancement)), ['warrior'])).toEqual(
      { ok: false }
    );
    expect(decodeBuild(text(JSON.stringify(slot)), ['warrior'])).toEqual({
      ok: false,
    });
  });
});

const d = WARRIOR.derivation;
const ls = piece('longsword');
const gs = piece('greatsword');
const levels = Array.from({ length: WARRIOR.maxLevel }, (_, i) => i + 1);

const plus = (
  block: AttributeBlock,
  over: Partial<AttributeBlock>
): AttributeBlock => {
  const out = { ...block };
  for (const [key, value] of Object.entries(over)) {
    out[key as keyof AttributeBlock] += value;
  }
  return out;
};

const projection = (talentTotal: number, talentStartLevel = 29) =>
  projectPlan({
    baseStats: WARRIOR.baseStats,
    allocation: WARRIOR.allocation,
    ratio: 2,
    talentStartLevel,
    talentTotal,
    maxLevel: WARRIOR.maxLevel,
    pointsPerLevel: WARRIOR.pointsPerLevel,
  });

const compute = (over: Partial<Build>) =>
  computeBuild(warrior(over), WARRIOR, CATALOG);

describe('computeBuild', () => {
  it.each([1, 20, 29, 40])(
    "matches today's planner with the tested weapons at level %i",
    (level) => {
      const snapshot = compute({ level, gear: { main: ls, swap: gs } });
      const totals = projection(23);
      const model = dpsModel({
        plan: totals,
        base: WARRIOR.baseStats,
        derivation: d,
        test: newBuild(WARRIOR).dpsTest,
        weaponAtk: { main: 41, swap: 105 },
        gearAtkDelta: 0,
      });

      expect(snapshot.level).toBe(level);
      expect(snapshot.totals).toEqual(totals);
      expect(snapshot.attributes).toEqual(totals[level - 1]);
      expect(snapshot.derived).toEqual(
        derivedStats(totals[level - 1]!, d, d.reference.gear)
      );
      expect(snapshot.dps.ok).toBe(model.ok);
      for (const l of levels) {
        expect(snapshot.dps.at(l)).toEqual(model.at(l));
      }
      expect(snapshot.talent).toEqual({
        total: 23,
        setBy: 'longsword',
        reachedAt: talentReachedAt(totals, 23),
      });
      expect(snapshot.missing).toEqual([]);
    }
  );

  it('adds gear attributes before derivation', () => {
    const snapshot = compute({
      level: 20,
      gear: { main: SWORD, helmet: HELM },
    });
    const attributes = plus(projection(23)[19]!, { str: 2, con: 1 });

    expect(snapshot.attributes).toEqual(attributes);
    expect(snapshot.gear.stats.physicalAtk.value).toBe(44);
    expect(snapshot.derived.attack).toBeCloseTo(
      derivedStats(attributes, d, [{ stat: 'physicalAtk', value: 44 }]).attack,
      10
    );
  });

  it("the build's own non-weapon gear doesn't move DPS", () => {
    const bare = compute({ gear: { main: ls, swap: gs } });
    const helmed = compute({
      gear: { main: ls, swap: gs, helmet: { ...HELM, lunagemId: 'ruby' } },
    });

    for (const l of levels) {
      expect(helmed.dps.at(l)).toEqual(bare.dps.at(l));
    }
  });

  it('defaults missing test attributes to base plus main-in-hand gear', () => {
    const build = warrior({ gear: { main: SWORD } });
    const snapshot = computeBuild(
      { ...build, dpsTest: { ...build.dpsTest, attributes: {} } },
      WARRIOR,
      CATALOG
    );

    // stat part 100 − 41, plus the sword's 40; its +2 STR is in the test reading
    expect(snapshot.dps.at(1).mainAtk).toBeCloseTo(99, 10);
  });

  it('computes swap DPS with the swap weapon in hand', () => {
    const snapshot = compute({
      level: 20,
      gear: { main: gs, swap: { ...SWORD, enhancement: 5 } },
    });
    const model = (plan: AttributeBlock[]) =>
      dpsModel({
        plan,
        base: WARRIOR.baseStats,
        derivation: d,
        test: newBuild(WARRIOR).dpsTest,
        weaponAtk: { main: 105, swap: 60 },
        gearAtkDelta: 0,
      }).at(20);

    expect(snapshot.dps.at(20).mainAtk).toBe(model(snapshot.totals).mainAtk);
    expect(snapshot.dps.at(20).swapAtk).toBe(
      model(snapshot.totals.map((totals) => plus(totals, { str: 3 }))).swapAtk
    );
  });

  it('falls back to the tested ATK when the weapon publishes none', () => {
    const build = warrior({ gear: { main: piece('atkless') } });
    const snapshot = computeBuild(
      { ...build, dpsTest: { ...build.dpsTest, attributes: {} } },
      WARRIOR,
      CATALOG
    );

    expect(snapshot.dps.at(1).mainAtk).toBeCloseTo(100, 10);
  });

  it('clamps level and talent start to the class', () => {
    const snapshot = compute({
      level: 99,
      allocation: { ratio: '2', talentStartLevel: 99 },
      gear: { main: ls },
    });

    expect(snapshot.level).toBe(40);
    expect(snapshot.totals).toEqual(projection(23, 40));
  });

  it('lists missing ids and leaves them out of the maths', () => {
    const snapshot = compute({
      gear: { main: ls, swap: gs, chest: piece('gone') },
      candidate: { slot: 'ring', piece: piece('mage-ring') },
    });
    const clean = compute({ gear: { main: ls, swap: gs } });

    expect(snapshot.missing).toEqual(['gone', 'mage-ring']);
    expect(snapshot.derived).toEqual(clean.derived);
    expect(snapshot.dps.at(20)).toEqual(clean.dps.at(20));
  });

  it("throws when the class isn't the build's", () => {
    expect(() => computeBuild(newBuild(MAGE), WARRIOR, CATALOG)).toThrow();
  });
});

describe('compareCandidate', () => {
  const base = warrior({ level: 20, gear: { main: ls, swap: gs } });
  const compare = (over: Partial<Build>) =>
    compareCandidate({ ...base, ...over }, WARRIOR, CATALOG);
  const zeros = { str: 0, agi: 0, con: 0, int: 0, tal: 0, end: 0 };

  it('returns null without a candidate', () => {
    expect(compare({})).toBeNull();
  });

  it("returns null for a candidate that doesn't resolve", () => {
    expect(
      compare({ candidate: { slot: 'helmet', piece: piece('gone') } })
    ).toBeNull();
    expect(
      compare({ candidate: { slot: 'main', piece: piece('staff') } })
    ).toBeNull();
  });

  it('adds a non-weapon piece through the gear ATK delta', () => {
    const current = computeBuild(base, WARRIOR, CATALOG).dps.at(20);
    const delta = compare({ candidate: { slot: 'helmet', piece: HELM } })!;

    expect(delta.slot).toBe('helmet');
    expect(delta.attributes).toEqual({ ...zeros, con: 1 });
    expect(delta.derived.attack).toBeCloseTo(4, 10);
    expect(delta.dps.mainAtk).toBeCloseTo(4, 10);
    expect(delta.dps.swapAtk).toBeCloseTo(4, 10);
    expect(delta.dps.main).toBeCloseTo(
      (current.main * 4) / current.mainAtk,
      10
    );
  });

  it('replaces the main weapon through weaponAtk, not the delta', () => {
    const delta = compare({
      candidate: { slot: 'main', piece: { ...SWORD, enhancement: 5 } },
    })!;

    // 60 − 41 weapon ATK, plus 1.3 per point of the sword's +3 STR
    expect(delta.attributes).toEqual({ ...zeros, str: 3 });
    expect(delta.dps.mainAtk).toBeCloseTo(19 + 1.3 * 3, 10);
    expect(delta.dps.swapAtk).toBeCloseTo(0, 10);
    expect(delta.derived.attack).toBeCloseTo(19 + 1.3 * 3, 10);
  });

  it('diffs against the piece already in the slot', () => {
    const delta = compare({
      gear: { ...base.gear, helmet: HELM },
      candidate: { slot: 'helmet', piece: { ...HELM, lunagemId: 'ruby' } },
    })!;

    expect(delta.attributes).toEqual(zeros);
    expect(delta.derived.attack).toBeCloseTo(5, 10);
    expect(delta.dps.mainAtk).toBeCloseTo(5, 10);
  });
});
