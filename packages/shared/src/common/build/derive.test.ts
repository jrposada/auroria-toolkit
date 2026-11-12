import { describe, expect, it } from 'vitest';

import { bareStats, derivedStats } from './derive.ts';
import { AttributeBlock } from './stats.ts';
import { MAGE, WARRIOR } from './test/classes.ts';

const d = WARRIOR.derivation;
const ref = d.reference.gear;
const base: AttributeBlock = WARRIOR.baseStats;

describe('derivedStats', () => {
  it("uses the seed's Warrior constants", () => {
    expect(WARRIOR.derivation).toEqual({
      provisional: true,
      reference: {
        attributes: { str: 54, agi: 16 },
        gear: [{ stat: 'physicalAtk', value: 41 }],
        values: {
          attack: 100,
          critRating: 684,
          critDamageRating: 2642,
          penetration: 27,
        },
      },
      perPoint: {
        attack: { str: 1.3, agi: 0.3 },
        critRating: { agi: 29 },
        critDamageRating: { agi: 36 },
        penetration: { str: 0.1, agi: 0.6 },
      },
      critRatingDivisor: 16000,
    });
  });

  it('returns the calibration values at the calibration point', () => {
    const derived = derivedStats({ ...base, str: 54, agi: 16 }, d, ref);

    expect(derived.attack).toBe(100);
    expect(derived.critPct).toBeCloseTo((684 / 16684) * 100, 10);
    expect(derived.critDamageRating).toBe(2642);
    expect(derived.penetration).toBe(27);
  });

  it('adds 1.3 Attack and 0.1 penetration per Strength', () => {
    const derived = derivedStats({ ...base, str: 64, agi: 16 }, d, ref);

    expect(derived.attack).toBeCloseTo(113, 10);
    expect(derived.penetration).toBeCloseTo(28, 10);
    expect(derived.critDamageRating).toBe(2642);
  });

  it('adds 0.3 Attack, 29 crit rating, 36 crit damage rating and 0.6 penetration per Agility', () => {
    const derived = derivedStats({ ...base, str: 54, agi: 18 }, d, ref);

    expect(derived.attack).toBeCloseTo(100.6, 10);
    expect(derived.critPct).toBeCloseTo((742 / 16742) * 100, 10);
    expect(derived.critDamageRating).toBe(2714);
    expect(derived.penetration).toBeCloseTo(28.2, 10);
  });

  it('ignores Constitution, Intelligence, Talent and Endurance', () => {
    expect(
      derivedStats(
        { str: 54, agi: 16, con: 99, int: 99, tal: 99, end: 99 },
        d,
        ref
      )
    ).toEqual(derivedStats({ ...base, str: 54, agi: 16 }, d, ref));
  });

  it('equals the pre-refactor formula exactly with the reference gear', () => {
    for (let str = 29; str <= 110; str++) {
      for (let agi = 10; agi <= 22; agi++) {
        const cr = 684 + 29 * (agi - 16);

        expect(derivedStats({ ...base, str, agi }, d, ref)).toEqual({
          attack: 100 + 1.3 * (str - 54) + 0.3 * (agi - 16),
          critPct: (cr / (cr + 16000)) * 100,
          critDamageRating: 2642 + 36 * (agi - 16),
          penetration: 27 + 0.1 * (str - 54) + 0.6 * (agi - 16),
        });
      }
    }
  });

  it('adds gear flat stats onto the bare stats', () => {
    const derived = derivedStats({ ...base, str: 54, agi: 16 }, d, [
      { stat: 'physicalAtk', value: 50 },
      { stat: 'physicalAtk', value: 1 },
      { stat: 'critRating', value: 316 },
      { stat: 'penetration', value: 3 },
    ]);

    expect(derived.attack).toBe(110);
    expect(derived.critPct).toBeCloseTo((1000 / 17000) * 100, 10);
    expect(derived.penetration).toBe(30);
  });

  it('ignores gear attributes, magic ATK and max HP', () => {
    const at = { ...base, str: 54, agi: 16 };

    expect(
      derivedStats(at, d, [
        { stat: 'str', value: 10 },
        { stat: 'magicAtk', value: 9 },
        { stat: 'maxHp', value: 9 },
      ])
    ).toEqual(derivedStats(at, d, []));
  });

  it("reads another class's coefficients", () => {
    expect(derivedStats({ ...base, int: 25 }, MAGE.derivation, []).attack).toBe(
      60
    );
    expect(
      derivedStats({ ...base, int: 25, str: 99 }, MAGE.derivation, []).attack
    ).toBe(60);
  });

  it('attributes missing from the reference contribute nothing', () => {
    expect(
      derivedStats({ ...base, int: 20, con: 99 }, MAGE.derivation, []).attack
    ).toBe(50);
  });
});

describe('bareStats', () => {
  it('subtracts the reference gear', () => {
    expect(bareStats({ ...base, str: 54, agi: 16 }, d)).toEqual({
      attack: 59,
      critRating: 684,
      critDamageRating: 2642,
      penetration: 27,
    });
  });
});
