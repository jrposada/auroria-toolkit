import { Weapon } from '@shared/models/weapons/weapon';
import { describe, expect, it } from 'vitest';

import { planFor, WEAPONS } from './test/game-data';
import {
  formatGold,
  formatStones,
  nextTileIndex,
  tabStopId,
  tileTap,
  tileView,
  weaponDetail,
} from './weapon-view';

const byId = (id: string): Weapon =>
  WEAPONS.find((weapon) => weapon.id === id)!;

describe('Given the weapon view-models', () => {
  it.each([
    [100, '100'],
    [500, '500'],
    [1000, '1k'],
    [4500, '4.5k'],
    [28500, '28.5k'],
    [238000, '238k'],
    [1093000, '1,093k'],
  ])('when formatting %s gold then it reads %s', (gold, text) => {
    expect(formatGold(gold)).toBe(text);
  });

  it('then stones read as count and grade initial', () => {
    expect(formatStones({ count: 40, grade: 'Brilliant' })).toBe('40 B');
  });

  it('when a requirement is above the current Talent then the tile is short', () => {
    expect(
      tileView(byId('twisted-fate-blade'), 'wrathful-tyrants-horn', 23)
    ).toEqual({ checked: false, requirement: 30, short: true });
    expect(
      tileView(byId('wrathful-tyrants-horn'), 'wrathful-tyrants-horn', 23)
    ).toEqual({ checked: true, requirement: 23, short: false });
    expect(tileView(byId('pioneer-longsword'), null, 11)).toEqual({
      checked: false,
      requirement: null,
      short: false,
    });
  });

  it('then the tab stop is the selected tile, else the first, else none', () => {
    const longswords = planFor().weapons.ls;

    expect(tabStopId(longswords, 'frozen-anguish')).toBe('frozen-anguish');
    expect(tabStopId(longswords, 'gone')).toBe('pioneer-longsword');
    expect(tabStopId([], null)).toBeNull();
  });

  it.each([
    ['ArrowRight', 0, 10, 1],
    ['ArrowDown', 9, 10, 0],
    ['ArrowLeft', 0, 10, 9],
    ['ArrowUp', 3, 10, 2],
    ['Enter', 3, 10, null],
    ['ArrowRight', 0, 0, null],
  ])(
    'when pressing %s on tile %s of %s then focus moves to %s',
    (key, index, count, next) => {
      expect(nextTileIndex(key, index, count)).toBe(next);
    }
  );

  it('when tapping then the open detail toggles', () => {
    expect(tileTap('a', null)).toBe('a');
    expect(tileTap('a', 'a')).toBeNull();
    expect(tileTap('b', 'a')).toBe('b');
  });

  it('when Twisted Fate Blade is not carried at level 40 then the detail shows it short', () => {
    expect(
      weaponDetail(byId('twisted-fate-blade'), planFor({ level: 40 }))
    ).toMatchObject({
      color: 'var(--r-epic)',
      physicalAtk: 92,
      magicAtk: null,
      share: { physical: 70, magic: 30, physicalWidth: 70, magicWidth: 30 },
      stagger: 100,
      exhaust: 100,
      weight: 1.65,
      talent: { requirement: 30, now: 23, met: false, reachedAt: null },
      lunastone: null,
      tempering: {
        levels: ['+1', '+5', '+10', '+15'],
        bonus: ['+13.3%', '+66.3%', '+154.7%', '+265%'],
        stones: ['1 F', '30 F', '30 V', '30 B'],
        gold: ['4.5k', '28.5k', '238k', '497k'],
      },
    });
  });

  it('when carried then the plan reaches its requirement', () => {
    expect(
      weaponDetail(
        byId('twisted-fate-blade'),
        planFor({ level: 40, lsId: 'twisted-fate-blade' })
      ).talent
    ).toEqual({ requirement: 30, now: 30, met: true, reachedAt: 38 });
  });

  it('then a Greatsword shows its share bar and published ATKs', () => {
    expect(
      weaponDetail(byId('royal-army-greatsword'), planFor())
    ).toMatchObject({
      physicalAtk: 105,
      magicAtk: 12,
      share: { physical: 180, magic: 20, physicalWidth: 90, magicWidth: 10 },
      stagger: 125,
      exhaust: 110,
      talent: null,
      lunastone: 'Physical Crit Damage +136–157',
    });
  });

  it('when no stones or gold are published then those rows are omitted', () => {
    expect(
      weaponDetail(byId('corrupt-meliots-greatsword'), planFor())
    ).toMatchObject({
      extraStat: 'Damage to Normal Monsters 16.3',
      tempering: {
        stones: null,
        gold: null,
        bonus: ['+13.3%', '+66.3%', '+154.7%', '+265%'],
      },
    });
  });

  it('then notes and how to get are passed through as data', () => {
    const detail = weaponDetail(byId('twisted-fate-blade'), planFor());

    expect(detail.howToGet).toBe(
      'Drop: Monstrous Tristan (Lv 51), 20% · Stardrift Hill completion'
    );
    expect(detail.notes).toContain('fix is pending');
  });
});
