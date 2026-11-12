import { describe, expect, it } from 'vitest';

import {
  fitsSlot,
  GearBonuses,
  gearBonuses,
  GearItem,
  GearPiece,
  GearSlot,
  pieceAtk,
  weaponToGearItem,
} from './gear.ts';
import { ATTRIBUTE_KEYS, STAT_IDS } from './stats.ts';
import {
  CATALOG,
  GREATSWORD,
  HELM,
  LONGSWORD,
  piece,
  SWORD,
} from './test/gear.ts';

const set = (gear: Partial<Record<GearSlot, GearPiece>>) => ({
  classId: 'warrior',
  gear,
});

const bonuses = (
  gear: Partial<Record<GearSlot, GearPiece>>,
  inHand: 'main' | 'swap' = 'main'
): GearBonuses => gearBonuses(set(gear), CATALOG, inHand);

const item = (id: string): GearItem =>
  CATALOG.items.find((candidate) => candidate.id === id)!;

describe('weaponToGearItem', () => {
  it('maps a weapon', () => {
    expect(weaponToGearItem(LONGSWORD)).toEqual({
      id: 'longsword',
      class: 'warrior',
      slotKind: 'weapon',
      weaponType: 'Longsword',
      talentRequirement: 23,
      baseStats: [{ stat: 'physicalAtk', value: 41 }],
      lunastone: null,
      rollOptions: [],
      tempering: LONGSWORD.tempering.steps.map(({ level, bonusPct }) => ({
        level,
        bonusPct,
      })),
    });
  });

  it('omits the ATK a weapon does not publish', () => {
    expect(
      weaponToGearItem({ ...GREATSWORD, physicalAtk: null, magicAtk: 12 })
        .baseStats
    ).toEqual([{ stat: 'magicAtk', value: 12 }]);
  });
});

describe('fitsSlot', () => {
  it("fits weapons of the build's class in either hand", () => {
    expect(fitsSlot(item('sword'), 'main', 'warrior')).toBe(true);
    expect(fitsSlot(item('sword'), 'swap', 'warrior')).toBe(true);
    expect(fitsSlot(item('sword'), 'main', 'mage')).toBe(false);
    expect(fitsSlot(item('staff'), 'main', 'warrior')).toBe(false);
  });

  it('fits classless or same-class armor and jewelry in its own slot', () => {
    expect(fitsSlot(item('helm'), 'helmet', 'warrior')).toBe(true);
    expect(fitsSlot(item('helm'), 'helmet', 'mage')).toBe(true);
    expect(fitsSlot(item('helm'), 'chest', 'warrior')).toBe(false);
    expect(fitsSlot(item('mage-ring'), 'ring', 'warrior')).toBe(false);
    expect(fitsSlot(item('mage-ring'), 'ring', 'mage')).toBe(true);
  });
});

describe('gearBonuses', () => {
  it('returns zeros for an empty build', () => {
    const result = bonuses({});

    for (const key of ATTRIBUTE_KEYS) {
      expect(result.attributes[key]).toBe(0);
    }
    for (const stat of STAT_IDS) {
      expect(result.stats[stat]).toEqual({ min: 0, max: 0, value: 0 });
    }
    expect(result.missing).toEqual([]);
  });

  it('multiplies base stats by the enhancement bonus', () => {
    const plus5 = bonuses({ main: { ...SWORD, enhancement: 5 } });
    expect(plus5.stats.physicalAtk).toEqual({ min: 60, max: 60, value: 60 });
    expect(plus5.attributes.str).toBe(3);

    const plus0 = bonuses({ main: SWORD });
    expect(plus0.stats.physicalAtk.value).toBe(40);
    expect(plus0.attributes.str).toBe(2);
  });

  it('does not multiply lunastone or roll stats', () => {
    const result = bonuses({ main: { ...SWORD, enhancement: 15 } });

    expect(result.stats.critRating).toEqual({ min: 10, max: 30, value: 20 });
    expect(result.stats.penetration).toEqual({ min: 4, max: 8, value: 6 });
  });

  it('uses the pinned roll, clamped to its range', () => {
    const pinned = (value: number) =>
      bonuses({ main: { ...SWORD, pinned: { critRating: value } } }).stats
        .critRating.value;

    expect(pinned(25)).toBe(25);
    expect(pinned(99)).toBe(30);
    expect(pinned(-1)).toBe(10);
    expect(
      bonuses({ main: { ...SWORD, pinned: { maxHp: 7 } } }).stats.maxHp
    ).toEqual({ min: 0, max: 0, value: 0 });
  });

  it('counts only the rolled option', () => {
    const atk = bonuses({ helmet: HELM });
    expect(atk.stats.physicalAtk).toEqual({ min: 2, max: 6, value: 4 });
    expect(atk.stats.maxHp).toEqual({ min: 50, max: 50, value: 50 });
    expect(atk.attributes.con).toBe(1);

    const hp = bonuses({ helmet: piece('helm', { rolled: 'maxHp' }) });
    expect(hp.stats.physicalAtk).toEqual({ min: 0, max: 0, value: 0 });
    expect(hp.stats.maxHp).toEqual({ min: 60, max: 70, value: 65 });
  });

  it('counts no roll option when rolled is null', () => {
    const helm = bonuses({ helmet: piece('helm') });
    expect(helm.stats.physicalAtk).toEqual({ min: 0, max: 0, value: 0 });
    expect(helm.stats.maxHp).toEqual({ min: 50, max: 50, value: 50 });

    const sword = bonuses({ main: piece('sword') });
    expect(sword.stats.penetration).toEqual({ min: 0, max: 0, value: 0 });
    expect(sword.stats.critRating).toEqual({ min: 10, max: 30, value: 20 });
  });

  it("ignores a rolled stat outside the item's options", () => {
    expect(
      bonuses({ helmet: piece('helm', { rolled: 'critRating' }) })
    ).toEqual(bonuses({ helmet: piece('helm') }));
  });

  it('clamps a pin within the rolled range', () => {
    const atk = (over: Partial<GearPiece>) =>
      bonuses({ helmet: piece('helm', over) }).stats.physicalAtk;

    expect(atk({ rolled: 'physicalAtk', pinned: { physicalAtk: 9 } })).toEqual({
      min: 2,
      max: 6,
      value: 6,
    });
    expect(atk({ rolled: 'physicalAtk', pinned: { physicalAtk: 1 } })).toEqual({
      min: 2,
      max: 6,
      value: 2,
    });
    expect(atk({ rolled: null, pinned: { physicalAtk: 5 } })).toEqual({
      min: 0,
      max: 0,
      value: 0,
    });
  });

  it('adds the Lunagem', () => {
    expect(
      bonuses({ helmet: { ...HELM, lunagemId: 'ruby' } }).stats.physicalAtk
    ).toEqual({ min: 7, max: 11, value: 9 });
    expect(
      bonuses({ main: { ...SWORD, lunagemId: 'amber' } }).attributes.str
    ).toBe(5);
  });

  it('counts only the weapon in hand', () => {
    const gear = { main: SWORD, swap: piece('greatsword') };

    const main = bonuses(gear, 'main');
    expect(main.stats.physicalAtk.value).toBe(40);
    expect(main.stats.critRating.value).toBe(20);

    const swap = bonuses(gear, 'swap');
    expect(swap.stats.physicalAtk.value).toBe(105);
    expect(swap.stats.critRating.value).toBe(0);
    expect(swap.attributes.str).toBe(0);
  });

  it('skips and reports missing ids', () => {
    const result = bonuses({
      chest: piece('gone'),
      helmet: { ...HELM, lunagemId: 'nope' },
    });

    expect(result.missing).toEqual(['nope', 'gone']);
    expect(result.stats.physicalAtk.value).toBe(4);
    expect(bonuses({ swap: piece('gone') }, 'main').missing).toEqual(['gone']);
  });

  it("skips items that don't fit the slot or class", () => {
    const result = bonuses({
      main: piece('staff'),
      ring: piece('mage-ring'),
      chest: piece('helm'),
    });

    expect(result.missing).toEqual(['staff', 'helm', 'mage-ring']);
    expect(result.stats.magicAtk.value).toBe(0);
    expect(result.stats.maxHp.value).toBe(0);
  });
});

describe('pieceAtk', () => {
  it("is the in-hand piece's own physical ATK", () => {
    expect(
      pieceAtk(
        set({ main: { ...SWORD, enhancement: 5, lunagemId: 'ruby' } }),
        CATALOG,
        'main'
      )
    ).toBe(65);
  });

  it('is null when the weapon publishes no ATK, is missing or does not fit', () => {
    expect(pieceAtk(set({ main: piece('atkless') }), CATALOG, 'main')).toBe(
      null
    );
    expect(pieceAtk(set({}), CATALOG, 'swap')).toBe(null);
    expect(pieceAtk(set({ main: piece('staff') }), CATALOG, 'main')).toBe(null);
    expect(pieceAtk(set({ main: piece('gone') }), CATALOG, 'main')).toBe(null);
  });
});
