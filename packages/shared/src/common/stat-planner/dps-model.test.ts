import { describe, expect, it } from 'vitest';

import { dpsModel, DpsModelInput, DpsTest } from './dps-model.ts';
import { StatBlock } from './stats.ts';

// statPart = 100 − 41 = 59; measured DPS 1200 / 10 = 120 and 1500 / 10 = 150
const test: DpsTest = {
  lsAtk: 41,
  lsDmg: 1200,
  lsSec: 10,
  gsAtk: 105,
  gsDmg: 1500,
  gsSec: 10,
  attack: 100,
  str: 54,
};

const stats = (over: Partial<StatBlock> = {}): StatBlock => ({
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
    baseAgi: 16,
    test,
    selected: { lsAtk: 41, gsAtk: 105 },
    ...over,
  });

describe('dpsModel', () => {
  it('returns the measured DPS at the test conditions', () => {
    const m = model();
    const result = m.at(1);

    expect(m.ok).toBe(true);
    expect(result.ls).toBeCloseTo(120, 10);
    expect(result.gs).toBeCloseTo(150, 10);
    expect(result.lsAtk).toBeCloseTo(100, 10);
    expect(result.gsAtk).toBeCloseTo(164, 10);
  });

  it('falls back to the tested ATK when the selected weapon publishes none', () => {
    expect(model({ selected: { lsAtk: null, gsAtk: null } }).at(1)).toEqual(
      model().at(1)
    );
  });

  it('projects with the selected weapon ATK when it is published', () => {
    const result = model({ selected: { lsAtk: 92, gsAtk: null } }).at(1);

    expect(result.lsAtk).toBeCloseTo(151, 10);
    expect(result.ls).toBeCloseTo(181.2, 10);
    expect(result.gs).toBeCloseTo(150, 10);
  });

  it('scales with Strength above the tested Strength', () => {
    const result = model({ plan: [stats({ str: 64 })] }).at(1);

    expect(result.lsAtk).toBeCloseTo(113, 10);
    expect(result.ls).toBeCloseTo(135.6, 10);
    expect(result.gs).toBeCloseTo((150 * 177) / 164, 10);
  });

  it('scales with Agility above the base Agility', () => {
    const result = model({ plan: [stats({ agi: 18 })] }).at(1);

    expect(result.lsAtk).toBeCloseTo(100.6, 10);
  });

  it('reads the plan entry for the requested level', () => {
    const m = model({ plan: [stats(), stats({ str: 64 })] });

    expect(m.at(2).lsAtk).toBeCloseTo(113, 10);
  });

  it.each([41, 30])(
    'is not ok when test Attack (%i) is not above the tested Longsword ATK',
    (attack) => {
      expect(model({ test: { ...test, attack } }).ok).toBe(false);
    }
  );

  it('never returns negative DPS', () => {
    // tested Strength far above the plan: projected Longsword Attack is negative
    const result = model({ test: { ...test, attack: 42, str: 154 } }).at(1);

    expect(result.lsAtk).toBeLessThan(0);
    expect(result.ls).toBe(0);
  });

  it('keeps DPS finite when a test lasted 0 seconds', () => {
    const result = model({ test: { ...test, lsSec: 0 } }).at(1);

    expect(result.ls).toBeCloseTo(12000, 6);
  });

  it.each([0, 2, Number.NaN])(
    'throws for level %j outside the plan',
    (level) => {
      expect(() => model().at(level)).toThrow(RangeError);
    }
  );
});
