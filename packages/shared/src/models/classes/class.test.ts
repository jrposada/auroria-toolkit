import { describe, expect, it } from 'vitest';

import { StatBlock } from '../../common/stat-planner/stats.ts';
import { classSchema, STAT_IDS } from './class.ts';
import { classesGetByIdParamsSchema } from './classes-get-by-id.ts';

const warrior = {
  id: 'warrior',
  name: 'Warrior',
  baseStats: { str: 29, agi: 16, con: 17, int: 10, tal: 11, end: 7 },
  pointsPerLevel: 3,
  maxLevel: 40,
  weaponTypes: ['Longsword', 'Greatsword'],
  allocation: { primary: 'str', secondary: 'con' },
  derivation: {
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
  },
};

const withDerivation = (derivation: object) => ({
  ...warrior,
  derivation: { ...warrior.derivation, ...derivation },
});
const withReference = (reference: object) =>
  withDerivation({
    reference: { ...warrior.derivation.reference, ...reference },
  });

describe('classSchema', () => {
  it('accepts the Warrior class', () => {
    const parsed = classSchema.parse(warrior);
    // compile-time: the schema output fits the planner type
    const baseStats: StatBlock = parsed.baseStats;
    expect(baseStats).toEqual(warrior.baseStats);
    expect(parsed.allocation).toEqual({ primary: 'str', secondary: 'con' });
    expect(parsed.derivation).toEqual(warrior.derivation);
  });

  it.each(['allocation', 'derivation'])('rejects a class without %s', (key) => {
    expect(
      classSchema.safeParse({ ...warrior, [key]: undefined }).success
    ).toBe(false);
  });

  it.each(['str', 'maxHp', 'magicAtk'])('accepts the gear stat %j', (stat) => {
    expect(
      classSchema.safeParse(withReference({ gear: [{ stat, value: 1 }] }))
        .success
    ).toBe(true);
  });

  it.each(['luck', 'attack', ''])('rejects the gear stat %j', (stat) => {
    expect(
      classSchema.safeParse(withReference({ gear: [{ stat, value: 1 }] }))
        .success
    ).toBe(false);
  });

  it('rejects an unknown attribute in a perPoint coefficient', () => {
    const perPoint = { ...warrior.derivation.perPoint, attack: { stre: 1.3 } };
    expect(classSchema.safeParse(withDerivation({ perPoint })).success).toBe(
      false
    );
  });

  it('rejects an unknown derived key in perPoint', () => {
    const perPoint = { atack: { str: 1.3 } };
    expect(classSchema.safeParse(withDerivation({ perPoint })).success).toBe(
      false
    );
  });

  it('rejects an unknown attribute in the reference attributes', () => {
    const attributes = { str: 54, luck: 1 };
    expect(classSchema.safeParse(withReference({ attributes })).success).toBe(
      false
    );
  });

  it('rejects a missing reference value', () => {
    const values = {
      ...warrior.derivation.reference.values,
      penetration: undefined,
    };
    expect(classSchema.safeParse(withReference({ values })).success).toBe(
      false
    );
  });

  it.each([0, -1])('rejects critRatingDivisor %j', (critRatingDivisor) => {
    expect(
      classSchema.safeParse(withDerivation({ critRatingDivisor })).success
    ).toBe(false);
  });

  it('rejects the same attribute as primary and secondary', () => {
    const allocation = { primary: 'str', secondary: 'str' };
    expect(classSchema.safeParse({ ...warrior, allocation }).success).toBe(
      false
    );
  });

  it('rejects an unknown allocation attribute', () => {
    const allocation = { primary: 'luck', secondary: 'con' };
    expect(classSchema.safeParse({ ...warrior, allocation }).success).toBe(
      false
    );
  });

  it.each(['Warrior', 'war rior', 'warrior-', '-warrior', ''])(
    'rejects the id %j',
    (id) => {
      expect(classSchema.safeParse({ ...warrior, id }).success).toBe(false);
    }
  );

  it('rejects a negative base stat', () => {
    const baseStats = { ...warrior.baseStats, str: -1 };
    expect(classSchema.safeParse({ ...warrior, baseStats }).success).toBe(
      false
    );
  });

  it('rejects a fractional base stat', () => {
    const baseStats = { ...warrior.baseStats, str: 29.5 };
    expect(classSchema.safeParse({ ...warrior, baseStats }).success).toBe(
      false
    );
  });

  it('rejects a missing base stat', () => {
    const { str, agi, con, int, tal } = warrior.baseStats;
    const baseStats = { str, agi, con, int, tal };
    expect(classSchema.safeParse({ ...warrior, baseStats }).success).toBe(
      false
    );
  });

  it.each([0, -3, 1.5])('rejects pointsPerLevel %j', (pointsPerLevel) => {
    expect(classSchema.safeParse({ ...warrior, pointsPerLevel }).success).toBe(
      false
    );
  });

  it.each([0, 40.5])('rejects maxLevel %j', (maxLevel) => {
    expect(classSchema.safeParse({ ...warrior, maxLevel }).success).toBe(false);
  });
});

describe('STAT_IDS', () => {
  it('lists the flat stats the calculations use', () => {
    expect(STAT_IDS).toEqual([
      'physicalAtk',
      'magicAtk',
      'critRating',
      'critDamageRating',
      'penetration',
      'maxHp',
    ]);
  });
});

describe('classesGetByIdParamsSchema', () => {
  it('accepts an id', () => {
    expect(
      classesGetByIdParamsSchema.safeParse({ id: 'warrior' }).success
    ).toBe(true);
  });

  it('rejects an empty id', () => {
    expect(classesGetByIdParamsSchema.safeParse({ id: '' }).success).toBe(
      false
    );
  });
});
