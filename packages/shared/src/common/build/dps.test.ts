import { describe, expect, it } from 'vitest';

import { dpsModel, DpsModelInput, DpsTest } from './dps.ts';
import { AttributeBlock } from './stats.ts';
import { WARRIOR } from './test/classes.ts';

// statPart = 100 − 41 = 59; measured DPS 1200 / 10 = 120 and 1500 / 10 = 150
const test: DpsTest = {
  attack: 100,
  attributes: { str: 54 },
  main: { weaponAtk: 41, damage: 1200, seconds: 10 },
  swap: { weaponAtk: 105, damage: 1500, seconds: 10 },
};

const stats = (over: Partial<AttributeBlock> = {}): AttributeBlock => ({
  str: 54,
  agi: 16,
  con: 17,
  int: 10,
  tal: 11,
  end: 7,
  ...over,
});

const model = (over: Partial<DpsModelInput> = {}) =>
  dpsModel({
    plan: [stats()],
    base: WARRIOR.baseStats,
    derivation: WARRIOR.derivation,
    test,
    weaponAtk: { main: 41, swap: 105 },
    gearAtkDelta: 0,
    ...over,
  });

describe('dpsModel', () => {
  it('returns the measured DPS at the test conditions', () => {
    const m = model();
    const result = m.at(1);

    expect(m.ok).toBe(true);
    expect(result.main).toBeCloseTo(120, 10);
    expect(result.swap).toBeCloseTo(150, 10);
    expect(result.mainAtk).toBeCloseTo(100, 10);
    expect(result.swapAtk).toBeCloseTo(164, 10);
  });

  it('falls back to the tested ATK when the selected weapon publishes none', () => {
    expect(model({ weaponAtk: { main: null, swap: null } }).at(1)).toEqual(
      model().at(1)
    );
  });

  it('projects with the selected weapon ATK when it is published', () => {
    const result = model({ weaponAtk: { main: 92, swap: null } }).at(1);

    expect(result.mainAtk).toBeCloseTo(151, 10);
    expect(result.main).toBeCloseTo(181.2, 10);
    expect(result.swap).toBeCloseTo(150, 10);
  });

  it('scales with Strength above the tested Strength', () => {
    const result = model({ plan: [stats({ str: 64 })] }).at(1);

    expect(result.mainAtk).toBeCloseTo(113, 10);
    expect(result.main).toBeCloseTo(135.6, 10);
    expect(result.swap).toBeCloseTo((150 * 177) / 164, 10);
  });

  it('scales with Agility above the base Agility', () => {
    const result = model({ plan: [stats({ agi: 18 })] }).at(1);

    expect(result.mainAtk).toBeCloseTo(100.6, 10);
  });

  it('reads the plan entry for the requested level', () => {
    const m = model({ plan: [stats(), stats({ str: 64 })] });

    expect(m.at(2).mainAtk).toBeCloseTo(113, 10);
  });

  it.each([41, 30])(
    'is not ok when test Attack (%i) is not above the tested main weapon ATK',
    (attack) => {
      expect(model({ test: { ...test, attack } }).ok).toBe(false);
    }
  );

  it('never returns negative DPS', () => {
    // tested Strength far above the plan: projected main weapon Attack is negative
    const result = model({
      test: { ...test, attack: 42, attributes: { str: 154 } },
    }).at(1);

    expect(result.mainAtk).toBeLessThan(0);
    expect(result.main).toBe(0);
  });

  it('keeps DPS finite when a test lasted 0 seconds', () => {
    const result = model({
      test: { ...test, main: { ...test.main, seconds: 0 } },
    }).at(1);

    expect(result.main).toBeCloseTo(12000, 6);
  });

  it.each([0, 2, Number.NaN])(
    'throws for level %j outside the plan',
    (level) => {
      expect(() => model().at(level)).toThrow(RangeError);
    }
  );

  it("moves both weapons' DPS by the gear ATK delta", () => {
    const result = model({ gearAtkDelta: 10 }).at(1);

    expect(result.mainAtk).toBeCloseTo(110, 10);
    expect(result.main).toBeCloseTo(132, 10);
    expect(result.swapAtk).toBeCloseTo(174, 10);
    expect(result.swap).toBeCloseTo((150 * 174) / 164, 10);
  });

  it('uses the tested Agility when the test records it', () => {
    const result = model({
      plan: [stats({ agi: 18 })],
      test: { ...test, attributes: { str: 54, agi: 18 } },
    }).at(1);

    expect(result.mainAtk).toBeCloseTo(100, 10);
  });

  it('defaults every attribute missing from the test to the class base', () => {
    // 59 + 1.3 × (54 − 29) + 41
    expect(
      model({ test: { ...test, attributes: {} } }).at(1).mainAtk
    ).toBeCloseTo(132.5, 10);
  });

  it('equals the pre-refactor formula exactly', () => {
    for (let str = 29; str <= 110; str++) {
      for (let agi = 14; agi <= 20; agi++) {
        const result = model({
          plan: [stats({ str, agi })],
          weaponAtk: { main: 92, swap: null },
        }).at(1);
        const mainAtk = 59 + 1.3 * (str - 54) + 0.3 * (agi - 16) + 92;

        expect(result.mainAtk).toBe(mainAtk);
        expect(result.main).toBe(Math.max(0, (120 * mainAtk) / 100));
      }
    }
  });
});
