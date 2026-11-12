import { describe, expect, it } from 'vitest';

import { planFor, WARRIOR, WEAPONS } from './test/game-data';
import { computePlan, Plan } from './use-plan';

const stats = (plan: Plan) => [
  plan.current.str,
  plan.current.con,
  plan.current.tal,
];

describe('Given computePlan', () => {
  it('when using the defaults at level 40 then it matches the reference plan', () => {
    const plan = planFor({ level: 40 });

    expect(stats(plan)).toEqual([95, 56, 23]);
    expect(plan.target).toMatchObject({ total: 23, reachedAt: 34 });
    expect(plan.target.setBy?.id).toBe('wrathful-tyrants-horn');
  });

  it('when using the defaults at level 30 then it matches the reference plan', () => {
    expect(stats(planFor({ level: 30 }))).toEqual([83, 46, 15]);
  });

  it('when selecting Twisted Fate Blade then the Talent target is 30', () => {
    const plan = planFor({ level: 40, lsId: 'twisted-fate-blade' });

    expect(plan.target).toMatchObject({ total: 30, reachedAt: 38 });
    expect(stats(plan)).toEqual([88, 56, 30]);
    expect(plan.target.setBy?.name).toBe('Twisted Fate Blade');
  });

  it('then weapons are grouped by type in API order', () => {
    const plan = planFor();

    expect(plan.weapons.ls.map((weapon) => weapon.id)).toEqual([
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
    ]);
    expect(plan.weapons.gs).toHaveLength(5);
  });

  it('when a stored id is unknown then the default weapon is selected', () => {
    expect(planFor({ lsId: 'gone', gsId: '' }).selected).toMatchObject({
      ls: { id: 'wrathful-tyrants-horn' },
      gs: { id: 'scattered-mist' },
    });
  });

  it('when neither weapon has a requirement then base Talent is the target', () => {
    expect(
      planFor({ lsId: 'pioneer-longsword', gsId: 'royal-army-greatsword' })
        .target
    ).toEqual({ total: 11, setBy: null, reachedAt: 1 });
  });

  it('when there are no weapons then nothing is selected and nothing throws', () => {
    const plan = planFor({}, []);

    expect(plan.selected).toEqual({ ls: null, gs: null });
    expect(plan.target.total).toBe(11);
    expect(plan.dps.ok).toBe(true);
  });

  it('when the stored level is above a shorter class then it is clamped', () => {
    const plan = planFor({ level: 40 }, WEAPONS, { ...WARRIOR, maxLevel: 10 });

    expect(plan.level).toBe(10);
    expect(plan.totals).toHaveLength(10);
    expect(plan.current).toBe(plan.totals[9]);
  });

  it('when the form state is junk then it computes the default plan', () => {
    expect(stats(computePlan('junk', WARRIOR, WEAPONS))).toEqual([29, 17, 11]);
  });

  it('when the selected weapon publishes its ATK then the DPS uses it', () => {
    const plan = planFor({ level: 40, lsId: 'twisted-fate-blade' });

    expect(Math.round(plan.dps.at(40).ls)).toBe(234);
  });
});
