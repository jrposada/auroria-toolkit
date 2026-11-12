import { Weapon, weaponSchema } from '../../../models/weapons/weapon.ts';
import { GearCatalog, GearPiece, weaponToGearItem } from '../gear.ts';

const step = (level: 1 | 5 | 10 | 15, bonusPct: number) => ({
  level,
  bonusPct,
  stonesPerTry: null,
  goldPerTry: null,
});

const weapon = (over: Partial<Weapon>): Weapon =>
  weaponSchema.parse({
    id: 'weapon',
    name: 'Weapon',
    class: 'warrior',
    type: 'Longsword',
    rarity: 'Legendary',
    itemLevel: 80,
    talentRequirement: null,
    weight: 2,
    physicalAtk: null,
    magicAtk: null,
    damageShare: { physical: 100, magic: 0 },
    staggerTrigger: 100,
    exhaustTrigger: 100,
    lunastone: null,
    extraStat: null,
    tempering: {
      steps: [step(1, 7.5), step(5, 37.5), step(10, 87.5), step(15, 150)],
    },
    howToGet: 'Crafted',
    notes: null,
    sources: [{ url: 'https://example.com/weapons', checked: '2026-11-07' }],
    ...over,
  });

/** The Longsword the default DPS test was taken with. */
export const LONGSWORD = weapon({
  id: 'longsword',
  physicalAtk: 41,
  talentRequirement: 23,
});

export const GREATSWORD = weapon({
  id: 'greatsword',
  type: 'Greatsword',
  physicalAtk: 105,
});

// Bonus percentages and ranges chosen so every expected value is exact.
export const CATALOG: GearCatalog = {
  items: [
    weaponToGearItem(LONGSWORD),
    weaponToGearItem(GREATSWORD),
    {
      id: 'sword',
      class: 'warrior',
      slotKind: 'weapon',
      weaponType: 'Longsword',
      talentRequirement: 23,
      baseStats: [
        { stat: 'physicalAtk', value: 40 },
        { stat: 'str', value: 2 },
      ],
      lunastone: { stat: 'critRating', min: 10, max: 30 },
      rollOptions: [{ stat: 'penetration', min: 4, max: 8 }],
      tempering: [
        { level: 1, bonusPct: 25 },
        { level: 5, bonusPct: 50 },
        { level: 10, bonusPct: 100 },
        { level: 15, bonusPct: 200 },
      ],
    },
    {
      id: 'atkless',
      class: 'warrior',
      slotKind: 'weapon',
      weaponType: 'Longsword',
      talentRequirement: null,
      baseStats: [{ stat: 'magicAtk', value: 7 }],
      lunastone: null,
      rollOptions: [],
      tempering: [],
    },
    {
      id: 'staff',
      class: 'mage',
      slotKind: 'weapon',
      weaponType: 'Staff',
      talentRequirement: null,
      baseStats: [{ stat: 'magicAtk', value: 50 }],
      lunastone: null,
      rollOptions: [],
      tempering: [],
    },
    {
      id: 'helm',
      class: null,
      slotKind: 'helmet',
      weaponType: null,
      talentRequirement: null,
      baseStats: [
        { stat: 'maxHp', value: 50 },
        { stat: 'con', value: 1 },
      ],
      lunastone: null,
      rollOptions: [
        { stat: 'physicalAtk', min: 2, max: 6 },
        { stat: 'maxHp', min: 10, max: 20 },
      ],
      tempering: [],
    },
    {
      id: 'mage-ring',
      class: 'mage',
      slotKind: 'ring',
      weaponType: null,
      talentRequirement: null,
      baseStats: [{ stat: 'magicAtk', value: 3 }],
      lunastone: null,
      rollOptions: [],
      tempering: [],
    },
  ],
  lunagems: [
    { id: 'ruby', stats: [{ stat: 'physicalAtk', value: 5 }] },
    { id: 'amber', stats: [{ stat: 'str', value: 3 }] },
  ],
};

export const piece = (itemId: string, over: Partial<GearPiece> = {}) =>
  ({
    itemId,
    enhancement: 0,
    lunagemId: null,
    rolled: null,
    pinned: {},
    ...over,
  }) satisfies GearPiece;

export const HELM = piece('helm', { rolled: 'physicalAtk' });
export const SWORD = piece('sword', { rolled: 'penetration' });
