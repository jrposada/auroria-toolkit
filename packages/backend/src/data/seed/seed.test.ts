import { classSchema } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { weaponSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { parseSeed, parseSeedFile, toClassRow, toWeaponRow } from './seed.ts';

const LONGSWORD_IDS = [
  'pioneer-longsword',
  'pirates-longsword',
  'city-guard-longsword',
  'inheritors-cutlass',
  'slins-shortblade',
  'martyrs-fang',
  'tarnished-ancient-longsword',
  'twisted-fate-blade',
  'frozen-anguish',
  'wrathful-tyrants-horn',
];
const GREATSWORD_IDS = [
  'royal-army-greatsword',
  'corrupt-meliots-greatsword',
  'covenant-greatsword',
  'fallen-margrave',
  'scattered-mist',
];
const SOURCE = {
  url: 'https://raiddex.com/en/archeage-chronicles/builds',
  checked: '2026-11-07',
};
const WARRIOR = {
  id: 'warrior',
  name: 'Warrior',
  baseStats: { str: 29, agi: 16, con: 17, int: 10, tal: 11, end: 7 },
  pointsPerLevel: 3,
  maxLevel: 40,
  weaponTypes: ['Longsword', 'Greatsword'],
};

describe('parseSeedFile', () => {
  it('returns the items of a valid file', () => {
    expect(
      parseSeedFile(classSchema, { version: 1, items: [WARRIOR] })
    ).toEqual([WARRIOR]);
  });

  it('throws a ZodError when an item is invalid', () => {
    const weapon = { ...parseSeed().weapons[0], rarity: 'Mythic' };

    expect(() =>
      parseSeedFile(weaponSchema, { version: 1, items: [weapon] })
    ).toThrow(ZodError);
  });

  it.each([{}, { items: [] }, { version: 1 }])(
    'throws when version or items is missing: %j',
    (file) => {
      expect(() => parseSeedFile(classSchema, file)).toThrow(ZodError);
    }
  );
});

describe('seed files', () => {
  const seed = parseSeed();
  const byId = (id: string) => {
    const weapon = seed.weapons.find((item) => item.id === id);
    if (!weapon) throw new Error(`No seeded weapon ${id}`);
    return weapon;
  };
  const pick = <TKey extends keyof (typeof seed.weapons)[number]>(key: TKey) =>
    Object.fromEntries(
      seed.weapons
        .filter((weapon) => weapon[key] !== null)
        .map((weapon) => [weapon.id, weapon[key]])
    );

  it('holds the Warrior class', () => {
    expect(seed.classes).toEqual([WARRIOR]);
  });

  it('holds 15 weapons in reference order', () => {
    expect(seed.weapons).toHaveLength(15);
    expect(seed.weapons.map((weapon) => weapon.id)).toEqual([
      ...LONGSWORD_IDS,
      ...GREATSWORD_IDS,
    ]);
  });

  it('has unique ids', () => {
    for (const items of [seed.classes, seed.weapons]) {
      const ids = items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('references only seeded classes, with one of their weapon types', () => {
    for (const weapon of seed.weapons) {
      const owner = seed.classes.find((item) => item.id === weapon.class);
      expect(owner?.weaponTypes, weapon.id).toContain(weapon.type);
    }
  });

  it('gives every weapon tempering levels 1, 5, 10, 15 in order', () => {
    for (const weapon of seed.weapons) {
      expect(
        weapon.tempering.steps.map((step) => step.level),
        weapon.id
      ).toEqual([1, 5, 10, 15]);
    }
  });

  it('gives every weapon the single RaidDex source', () => {
    for (const weapon of seed.weapons) {
      expect(weapon.sources, weapon.id).toEqual([SOURCE]);
    }
  });

  it('copies the per-type constants', () => {
    for (const id of LONGSWORD_IDS) {
      expect(byId(id)).toMatchObject({
        type: 'Longsword',
        damageShare: { physical: 70, magic: 30 },
        staggerTrigger: 100,
        exhaustTrigger: 100,
      });
    }
    for (const id of GREATSWORD_IDS) {
      expect(byId(id)).toMatchObject({
        type: 'Greatsword',
        damageShare: { physical: 180, magic: 20 },
        staggerTrigger: 125,
        exhaustTrigger: 110,
      });
    }
  });

  it('converts City Guard Longsword field by field', () => {
    expect(byId('city-guard-longsword')).toEqual({
      id: 'city-guard-longsword',
      name: 'City Guard Longsword',
      class: 'warrior',
      type: 'Longsword',
      rarity: 'Uncommon',
      itemLevel: 10,
      talentRequirement: null,
      weight: 1.58,
      physicalAtk: 41,
      magicAtk: 18,
      damageShare: { physical: 70, magic: 30 },
      staggerTrigger: 100,
      exhaustTrigger: 100,
      lunastone: 'Physical Crit Chance +53–61',
      extraStat: null,
      tempering: {
        steps: [
          {
            level: 1,
            bonusPct: 14.3,
            stonesPerTry: { count: 1, grade: 'Faint' },
            goldPerTry: 500,
          },
          {
            level: 5,
            bonusPct: 71.3,
            stonesPerTry: { count: 8, grade: 'Faint' },
            goldPerTry: 3500,
          },
          {
            level: 10,
            bonusPct: 166.4,
            stonesPerTry: { count: 8, grade: 'Vivid' },
            goldPerTry: 29000,
          },
          {
            level: 15,
            bonusPct: 285,
            stonesPerTry: { count: 8, grade: 'Brilliant' },
            goldPerTry: 61000,
          },
        ],
      },
      howToGet: 'Crafted (Smithing)',
      notes: null,
      sources: [SOURCE],
    });
  });

  it("leaves stones and gold null for Corrupt Meliot's Greatsword", () => {
    const weapon = byId('corrupt-meliots-greatsword');

    expect(weapon.name).toBe("Corrupt Meliot's Greatsword");
    expect(weapon.extraStat).toBe('Damage to Normal Monsters 16.3');
    expect(weapon.tempering.steps).toEqual([
      { level: 1, bonusPct: 13.3, stonesPerTry: null, goldPerTry: null },
      { level: 5, bonusPct: 66.3, stonesPerTry: null, goldPerTry: null },
      { level: 10, bonusPct: 154.7, stonesPerTry: null, goldPerTry: null },
      { level: 15, bonusPct: 265, stonesPerTry: null, goldPerTry: null },
    ]);
  });

  it('publishes stones and gold for every other weapon', () => {
    for (const weapon of seed.weapons) {
      if (weapon.id === 'corrupt-meliots-greatsword') continue;
      for (const step of weapon.tempering.steps) {
        expect(step.stonesPerTry, weapon.id).not.toBeNull();
        expect(step.goldPerTry, weapon.id).not.toBeNull();
      }
    }
  });

  it('keeps the talent requirements', () => {
    expect(pick('talentRequirement')).toEqual({
      'tarnished-ancient-longsword': 14,
      'twisted-fate-blade': 30,
      'frozen-anguish': 18,
      'wrathful-tyrants-horn': 23,
      'fallen-margrave': 14,
      'scattered-mist': 23,
    });
  });

  it('keeps published ATK only where the reference has it', () => {
    expect(pick('physicalAtk')).toEqual({
      'city-guard-longsword': 41,
      'slins-shortblade': 52,
      'twisted-fate-blade': 92,
      'royal-army-greatsword': 105,
    });
    expect(pick('magicAtk')).toEqual({
      'city-guard-longsword': 18,
      'royal-army-greatsword': 12,
    });
  });

  it('copies text character for character', () => {
    expect(byId('twisted-fate-blade').notes).toBe(
      'XLGAMES: a “Twisted Faith Sword” gains too many stats when tempered; a fix is pending.'
    );
    expect(pick('notes')).toHaveProperty('twisted-fate-blade');
    expect(Object.keys(pick('notes'))).toHaveLength(1);
    expect(byId('twisted-fate-blade').howToGet).toBe(
      'Drop: Monstrous Tristan (Lv 51), 20% · Stardrift Hill completion'
    );
    expect(byId('wrathful-tyrants-horn').name).toBe("Wrathful Tyrant's Horn");
    expect(byId('wrathful-tyrants-horn').lunastone).toBe('Fire ATK +10–67');
    expect(byId('scattered-mist').lunastone).toBe('Fog ATK +13–94');
    expect(byId('pirates-longsword').howToGet).toBe(
      'Drop: Pallatius the Severer (Lv 5, Lost Docks), 100%'
    );
  });

  it('builds a class row with every field', () => {
    expect(toClassRow(WARRIOR)).toEqual(WARRIOR);
  });

  it('builds a weapon row with class as classId and every other field', () => {
    const { class: classId, ...rest } = byId('city-guard-longsword');

    expect(toWeaponRow(byId('city-guard-longsword'))).toEqual({
      ...rest,
      classId,
    });
  });
});
