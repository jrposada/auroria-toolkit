import { describe, expect, it } from 'vitest';

import { availablePoints } from './available-points.ts';
import {
  PlanRatio,
  projectPlan,
  ProjectPlanInput,
  talentReachedAt,
} from './project-plan.ts';
import { STAT_KEYS, StatBlock } from './stats.ts';
import { talentTarget } from './talent-target.ts';

const WARRIOR_BASE: StatBlock = {
  str: 29,
  agi: 16,
  con: 17,
  int: 10,
  tal: 11,
  end: 7,
};

const w = (id: string, talentRequirement: number | null) => ({
  id,
  talentRequirement,
});

const plan = (over: Partial<ProjectPlanInput> = {}) =>
  projectPlan({
    baseStats: WARRIOR_BASE,
    ratio: 2,
    talentStartLevel: 29,
    talentTotal: 23,
    maxLevel: 40,
    pointsPerLevel: 3,
    ...over,
  });

const at = (p: StatBlock[], level: number) => {
  const totals = p[level - 1]!;
  return [totals.str, totals.con, totals.tal];
};

describe("default plan (2:1, Talent from 29, Wrathful Tyrant's Horn + Scattered Mist)", () => {
  const target = talentTarget(11, [
    w('wrathful-tyrants-horn', 23),
    w('scattered-mist', 23),
  ]).total;
  const p = plan({ talentTotal: target });

  it('has one entry per level, starting from the base stats', () => {
    expect(p).toHaveLength(40);
    expect(p[0]).toEqual(WARRIOR_BASE);
  });

  it('reaches STR 95 / CON 56 / TAL 23 at level 40', () => {
    expect(at(p, 40)).toEqual([95, 56, 23]);
  });

  it('reaches Talent at level 34', () => {
    expect(talentReachedAt(p, target)).toBe(34);
  });

  it('has STR 83 / CON 46 / TAL 15 at level 30', () => {
    expect(at(p, 30)).toEqual([83, 46, 15]);
  });

  it('leaves Agility, Intelligence and Endurance at base on every level', () => {
    for (const totals of p) {
      expect([totals.agi, totals.int, totals.end]).toEqual([16, 10, 7]);
    }
  });
});

describe('Twisted Fate Blade (target 30), 2:1, Talent from 29', () => {
  const target = talentTarget(11, [
    w('twisted-fate-blade', 30),
    w('scattered-mist', 23),
  ]).total;
  const p = plan({ talentTotal: target });

  it('reaches STR 88 / CON 56 / TAL 30 at level 40', () => {
    expect(at(p, 40)).toEqual([88, 56, 30]);
  });

  it('reaches Talent at level 38', () => {
    expect(talentReachedAt(p, target)).toBe(38);
  });
});

const RATIOS: PlanRatio[] = [3, 2, 1, 0.5];
const combinations = RATIOS.flatMap((ratio) =>
  [11, 23, 30].map((talentTotal) => ({ ratio, talentTotal }))
);

describe.each(combinations)(
  'ratio $ratio, Talent target $talentTotal',
  ({ ratio, talentTotal }) => {
    const p = plan({ ratio, talentTotal });

    it('spends exactly (level − 1) × 3 points at every level', () => {
      p.forEach((totals, index) => {
        const spent = STAT_KEYS.reduce(
          (sum, key) => sum + totals[key] - WARRIOR_BASE[key],
          0
        );
        expect(spent).toBe(availablePoints(index + 1));
      });
    });

    it('never drops a total below base', () => {
      for (const totals of p) {
        for (const key of STAT_KEYS) {
          expect(totals[key]).toBeGreaterThanOrEqual(WARRIOR_BASE[key]);
        }
      }
    });
  }
);

describe('projectPlan', () => {
  it.each<[PlanRatio, number, number, number[], number]>([
    [3, 29, 23, [105, 46, 23], 34],
    // ratio ≤ 1: Constitution's share is used too
    [1, 29, 23, [82, 69, 23], 32],
    [0.5, 29, 23, [64, 87, 23], 32],
    [1, 29, 30, [78, 66, 30], 35],
    // early start: the deficit no longer fits in the remaining levels
    [2, 40, 30, [93, 51, 30], 40],
    [3, 40, 30, [102, 42, 30], 40],
    [0.5, 40, 30, [61, 83, 30], 40],
  ])(
    'ratio %s, Talent from %i, target %i',
    (ratio, talentStartLevel, talentTotal, level40, reachedAt) => {
      const p = plan({ ratio, talentStartLevel, talentTotal });

      expect(at(p, 40)).toEqual(level40);
      expect(talentReachedAt(p, talentTotal)).toBe(reachedAt);
    }
  );

  it('puts the first level-up into Strength and Constitution by cumulative rounding', () => {
    expect(at(plan(), 2)).toEqual([31, 18, 11]);
    expect(at(plan({ ratio: 0.5 }), 2)).toEqual([30, 19, 11]);
  });

  it('takes Talent from the Strength share only while the target is on track', () => {
    const p = plan({ talentStartLevel: 2 });

    expect(at(p, 6)).toEqual([29, 22, 21]);
    expect(talentReachedAt(p, 23)).toBe(7);
    expect(at(p, 40)).toEqual([95, 56, 23]);
  });

  it.each([11, 5])(
    'spends no points on Talent when the target (%i) is at or below base',
    (talentTotal) => {
      const p = plan({ talentTotal });

      expect(at(p, 40)).toEqual([107, 56, 11]);
      expect(talentReachedAt(p, talentTotal)).toBe(1);
    }
  );

  it('treats a start level past the last level as the last level', () => {
    const p = plan({ talentStartLevel: 99 });

    expect(at(p, 40)).toEqual([99, 52, 23]);
    expect(talentReachedAt(p, 23)).toBe(40);
  });

  it('spends every point on Talent and reports it unreached when the target is out of range', () => {
    const p = plan({ talentTotal: 200 });

    expect(at(p, 40)).toEqual([29, 17, 128]);
    expect(talentReachedAt(p, 200)).toBeNull();
  });

  it('does not mutate the base stats or share objects between levels', () => {
    const baseStats = { ...WARRIOR_BASE };
    const p = plan({ baseStats });

    expect(baseStats).toEqual(WARRIOR_BASE);
    expect(p[0]).not.toBe(baseStats);
    expect(p[0]).not.toBe(p[1]);
  });
});
