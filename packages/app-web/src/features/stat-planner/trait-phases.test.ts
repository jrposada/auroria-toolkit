import { describe, expect, it } from 'vitest';

import { PHASES, traitPhaseStatuses } from './trait-phases';

const states = (points: number) =>
  traitPhaseStatuses(points).map((phase) => phase.state);

describe('Given the Longsword trait phases', () => {
  it('then it has the eight reference phases', () => {
    expect(PHASES.map((phase) => phase.cost)).toEqual([
      5, 4, 3, 5, 7, 20, 14, 34,
    ]);
    expect(PHASES[0]).toEqual({
      title: 'Parry → Sharpwake',
      nodes:
        'Parry, Counterattack, Longsword Proficiency, Swift Flurry, Sharpwake',
      description:
        'Parries grant Sharpwake: crit and damage up for 20 s, 3 stacks. Your main crit source.',
      cost: 5,
    });
    expect(PHASES[7]!.title).toBe('Greatsword swap');
    expect(PHASES[5]!.nodes).toContain('Bloodstorm Mastery I–II');
  });

  it('when no points are earned then every phase is later', () => {
    expect(states(0)).toEqual(Array(8).fill('todo'));
  });

  it('when 7 points are earned then the first is done and the second has 2 to go', () => {
    const statuses = traitPhaseStatuses(7);

    expect(states(7).slice(0, 3)).toEqual(['done', 'part', 'todo']);
    expect(statuses[1]).toMatchObject({ total: 9, toGo: 2 });
  });

  it('when exactly on a boundary then the next phase is still later', () => {
    expect(states(5).slice(0, 2)).toEqual(['done', 'todo']);
  });

  it('when 92 or more points are earned then every phase is done', () => {
    expect(states(92)).toEqual(Array(8).fill('done'));
    expect(states(500)).toEqual(Array(8).fill('done'));
  });

  it('then the running totals end at 92', () => {
    expect(traitPhaseStatuses(0).map((phase) => phase.total)).toEqual([
      5, 9, 12, 17, 24, 44, 58, 92,
    ]);
  });

  it('when points are fractional then the remainder keeps the fraction', () => {
    expect(traitPhaseStatuses(2.5)[0]).toMatchObject({
      state: 'part',
      toGo: 2.5,
    });
  });
});
