import { describe, expect, it } from 'vitest';

import { derivedStats } from './derived-stats.ts';
import { StatBlock } from './stats.ts';

const base: StatBlock = { str: 29, agi: 16, con: 17, int: 10, tal: 11, end: 7 };

describe('derivedStats', () => {
  it('returns the calibration values at the calibration point', () => {
    const derived = derivedStats({ ...base, str: 54, agi: 16 });

    expect(derived.attack).toBe(100);
    expect(derived.critPct).toBeCloseTo((684 / 16684) * 100, 10);
    expect(derived.critDamageRating).toBe(2642);
    expect(derived.penetration).toBe(27);
  });

  it('adds 1.3 Attack and 0.1 penetration per Strength', () => {
    const derived = derivedStats({ ...base, str: 64, agi: 16 });

    expect(derived.attack).toBeCloseTo(113, 10);
    expect(derived.penetration).toBeCloseTo(28, 10);
    expect(derived.critDamageRating).toBe(2642);
  });

  it('adds 0.3 Attack, 29 crit rating, 36 crit damage rating and 0.6 penetration per Agility', () => {
    const derived = derivedStats({ ...base, str: 54, agi: 18 });

    expect(derived.attack).toBeCloseTo(100.6, 10);
    expect(derived.critPct).toBeCloseTo((742 / 16742) * 100, 10);
    expect(derived.critDamageRating).toBe(2714);
    expect(derived.penetration).toBeCloseTo(28.2, 10);
  });

  it('ignores Constitution, Intelligence, Talent and Endurance', () => {
    expect(
      derivedStats({ str: 54, agi: 16, con: 99, int: 99, tal: 99, end: 99 })
    ).toEqual(derivedStats({ ...base, str: 54, agi: 16 }));
  });
});
