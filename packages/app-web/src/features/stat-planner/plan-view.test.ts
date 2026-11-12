import { describe, expect, it } from 'vitest';

import {
  calibrationValues,
  derivedView,
  dpsSeries,
  dpsVerdict,
  dpsView,
  nextLevel,
  pointsSpent,
  projection,
  statRows,
  totalsSeries,
} from './plan-view';
import { planFor } from './test/game-data';

describe('Given the plan view-models', () => {
  it('when at level 27 then the stat rows match the reference', () => {
    const rows = statRows(planFor({ level: 27 }));

    expect(
      rows.map((row) => [row.key, row.base, row.spent, row.total, row.barPct])
    ).toEqual([
      ['str', 29, 52, 81, 85],
      ['agi', 16, 0, 16, 17],
      ['con', 17, 26, 43, 45],
      ['int', 10, 0, 10, 11],
      ['tal', 11, 0, 11, 12],
      ['end', 7, 0, 7, 7],
    ]);
    expect(rows.map((row) => row.tone)).toEqual([
      'strength',
      'fixed',
      'constitution',
      'fixed',
      'talent',
      'fixed',
    ]);
  });

  it('then points spent equal the points available', () => {
    expect(pointsSpent(planFor({ level: 40 }))).toEqual({
      spent: 117,
      available: 117,
    });
    expect(pointsSpent(planFor())).toEqual({ spent: 0, available: 0 });
  });

  it('when at level 1 then the next level gains Strength and Constitution', () => {
    expect(nextLevel(planFor())).toEqual({
      kind: 'next',
      from: 1,
      to: 2,
      gains: [
        { key: 'str', amount: 2 },
        { key: 'con', amount: 1 },
      ],
      talentUp: false,
    });
  });

  it('when at level 29 then the next level spends on Talent', () => {
    expect(nextLevel(planFor({ level: 29 }))).toMatchObject({
      gains: [
        { key: 'con', amount: 1 },
        { key: 'tal', amount: 2 },
      ],
      talentUp: true,
    });
  });

  it('when at the max level then there is no next level', () => {
    expect(nextLevel(planFor({ level: 40 }))).toEqual({
      kind: 'max',
      level: 40,
      points: 117,
    });
  });

  it('then the derived stats are formatted as the reference does', () => {
    expect(derivedView(planFor())).toEqual({
      attack: '68',
      critChance: '4.1%',
      critDamageRating: '2642',
      penetration: '24.5',
    });
    expect(derivedView(planFor({ level: 40 }))).toMatchObject({
      attack: '153',
      penetration: '31.1',
    });
  });

  it('then the calibration values are formatted for the note', () => {
    expect(calibrationValues()).toEqual({
      str: '54',
      agi: '16',
      attack: '100',
      critRating: '684',
      critPct: '4.1',
      critDamage: '2642',
      pen: '27',
      attackPerStr: '1.3',
      penPerStr: '0.1',
      divisor: '16,000',
    });
  });

  it.each([
    [100, 101.9, { kind: 'even' }],
    [100, 98.1, { kind: 'even' }],
    [100, 102, { kind: 'ahead', slot: 'gs', pct: '2' }],
    [100, 97, { kind: 'ahead', slot: 'ls', pct: '3' }],
    [0, 50, { kind: 'even' }],
  ])(
    'when Longsword is %s and Greatsword %s then the verdict is %j',
    (ls, gs, verdict) => {
      expect(dpsVerdict(ls, gs)).toEqual(verdict);
    }
  );

  it('when using the defaults then the DPS view matches the reference', () => {
    expect(dpsView(planFor())).toEqual({
      ok: true,
      verdict: { kind: 'ahead', slot: 'gs', pct: '48' },
      ls: { dps: '81', attack: '68', perStrength: '+1.93%' },
      gs: { dps: '120', attack: '132', perStrength: '+0.99%' },
    });
    expect(dpsView(planFor({ level: 40 }))).toMatchObject({
      verdict: { pct: '8' },
      ls: { dps: '184' },
      gs: { dps: '199' },
    });
  });

  it('when Twisted Fate Blade is carried at 40 then the Longsword is ahead', () => {
    expect(
      dpsView(planFor({ level: 40, lsId: 'twisted-fate-blade' }))
    ).toMatchObject({
      verdict: { kind: 'ahead', slot: 'ls', pct: '19' },
      ls: { dps: '234', attack: '195', perStrength: '+0.67%' },
      gs: { dps: '190', attack: '208' },
    });
  });

  it.each([{ testAttack: 41 }, { testAttack: 30 }])(
    'when test Attack is not above the Longsword ATK (%j) then the view is not ok',
    (form) => {
      expect(dpsView(planFor(form))).toEqual({ ok: false });
    }
  );

  it('when seconds are zero and damage negative then nothing is NaN or Infinity', () => {
    expect(
      JSON.stringify(dpsView(planFor({ lsSec: 0, gsDmg: -5 })))
    ).not.toMatch(/NaN|Infinity/);
  });

  it('then the projection names the selected weapon only when its ATK is published', () => {
    expect(projection(planFor({ lsId: 'twisted-fate-blade' }), 'ls')).toEqual({
      kind: 'selected',
      name: 'Twisted Fate Blade',
      atk: 92,
    });
    expect(projection(planFor(), 'gs')).toEqual({
      kind: 'tested',
      name: 'Scattered Mist',
    });
    expect(projection(planFor({}, []), 'ls')).toEqual({
      kind: 'tested',
      name: null,
    });
  });

  it('then the chart series cover every level', () => {
    const totals = totalsSeries(planFor());
    expect(totals.str).toHaveLength(40);
    expect([totals.str[39], totals.con[39], totals.tal[39]]).toEqual([
      95, 56, 23,
    ]);

    const dps = dpsSeries(planFor());
    expect(dps.ls).toHaveLength(40);
    expect(dps.step).toBe(50);
  });
});
