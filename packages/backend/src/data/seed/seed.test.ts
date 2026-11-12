import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { classSchema } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { materialSchema } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import type { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import { recipeSchema } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import { weaponSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { MATERIALS, RECIPES } from './crafting-fixtures.ts';
import {
  assertRecipeReferences,
  parseSeed,
  parseSeedFile,
  toClassRow,
  toMaterialRow,
  toRecipeIngredientRows,
  toRecipeRow,
  toWeaponRow,
} from './seed.ts';

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
} satisfies Class;

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

  it('holds no materials and no recipes yet', () => {
    expect(seed.materials).toEqual([]);
    expect(seed.recipes).toEqual([]);
  });

  it('holds 15 weapons in reference order', () => {
    expect(seed.weapons).toHaveLength(15);
    expect(seed.weapons.map((weapon) => weapon.id)).toEqual([
      ...LONGSWORD_IDS,
      ...GREATSWORD_IDS,
    ]);
  });

  it('has unique ids', () => {
    for (const items of [
      seed.classes,
      seed.weapons,
      seed.materials,
      seed.recipes,
    ]) {
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

function recipe(id: string): Recipe {
  const found = RECIPES.find((item) => item.id === id);
  if (!found) throw new Error(`No fixture recipe ${id}`);
  return found;
}

describe('crafting fixtures', () => {
  it('parse as seed files', () => {
    expect(
      parseSeedFile(materialSchema, { version: 1, items: MATERIALS })
    ).toEqual(MATERIALS);
    expect(parseSeedFile(recipeSchema, { version: 1, items: RECIPES })).toEqual(
      RECIPES
    );
  });

  it('builds a material row with every field', () => {
    expect(toMaterialRow({ id: 'charcoal', name: 'Charcoal' })).toEqual({
      id: 'charcoal',
      name: 'Charcoal',
    });
  });

  it('builds a recipe row with the output flattened and no ingredients', () => {
    expect(toRecipeRow(recipe('iron-ingot-bulk-smelting'))).toEqual({
      id: 'iron-ingot-bulk-smelting',
      outputMaterialId: 'iron-ingot',
      outputQuantity: 5,
      station: 'Smelter',
      profession: 'Metalwork',
      professionLevel: 10,
      goldCost: 50,
    });
  });

  it('builds one ingredient row per ingredient', () => {
    expect(toRecipeIngredientRows(recipe('iron-ingot-bulk-smelting'))).toEqual([
      {
        recipeId: 'iron-ingot-bulk-smelting',
        materialId: 'charcoal',
        quantity: 2,
      },
      {
        recipeId: 'iron-ingot-bulk-smelting',
        materialId: 'iron-ore',
        quantity: 12,
      },
    ]);
  });

  it('builds no ingredient rows for a recipe without ingredients', () => {
    expect(
      toRecipeIngredientRows({
        ...recipe('iron-ingot-smelting'),
        ingredients: [],
      })
    ).toEqual([]);
  });
});

describe('assertRecipeReferences', () => {
  const without = (id: string) => MATERIALS.filter((item) => item.id !== id);

  it('accepts the fixtures', () => {
    expect(() =>
      assertRecipeReferences({ materials: MATERIALS, recipes: RECIPES })
    ).not.toThrow();
  });

  it('accepts an empty seed', () => {
    expect(() =>
      assertRecipeReferences({ materials: [], recipes: [] })
    ).not.toThrow();
  });

  it('throws when an ingredient references a missing material', () => {
    expect(() =>
      assertRecipeReferences({
        materials: without('charcoal'),
        recipes: RECIPES,
      })
    ).toThrow(
      'Recipe iron-ingot-bulk-smelting references missing material charcoal'
    );
  });

  it('throws when the output references a missing material', () => {
    expect(() =>
      assertRecipeReferences({
        materials: without('steel-ingot'),
        recipes: RECIPES,
      })
    ).toThrow(
      'Recipe steel-ingot-forging references missing material steel-ingot'
    );
  });

  it('throws when a recipe lists a material twice', () => {
    const doubled = {
      ...recipe('iron-ingot-smelting'),
      ingredients: [
        { materialId: 'iron-ore', quantity: 3 },
        { materialId: 'iron-ore', quantity: 1 },
      ],
    };

    expect(() =>
      assertRecipeReferences({ materials: MATERIALS, recipes: [doubled] })
    ).toThrow(
      'Recipe iron-ingot-smelting lists material iron-ore more than once'
    );
  });
});
