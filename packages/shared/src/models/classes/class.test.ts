import { describe, expect, it } from 'vitest';

import { StatBlock } from '../../common/stat-planner/stats.ts';
import { classSchema } from './class.ts';
import { classesGetByIdParamsSchema } from './classes-get-by-id.ts';

const warrior = {
  id: 'warrior',
  name: 'Warrior',
  baseStats: { str: 29, agi: 16, con: 17, int: 10, tal: 11, end: 7 },
  pointsPerLevel: 3,
  maxLevel: 40,
  weaponTypes: ['Longsword', 'Greatsword'],
};

describe('classSchema', () => {
  it('accepts the Warrior class', () => {
    const parsed = classSchema.parse(warrior);
    // compile-time: the schema output fits the planner type
    const baseStats: StatBlock = parsed.baseStats;
    expect(baseStats).toEqual(warrior.baseStats);
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
