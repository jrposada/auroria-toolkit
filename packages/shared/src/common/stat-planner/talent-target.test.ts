import { describe, expect, it } from 'vitest';

import { talentTarget } from './talent-target.ts';

const w = (id: string, talentRequirement: number | null) => ({
  id,
  talentRequirement,
});

describe('talentTarget', () => {
  it('is the base Talent when no weapon has a requirement', () => {
    expect(
      talentTarget(11, [
        w('pioneer-longsword', null),
        w('royal-army-greatsword', null),
      ])
    ).toEqual({ total: 11, setBy: null });
  });

  it('is the highest requirement, set by that weapon', () => {
    expect(
      talentTarget(11, [w('twisted-fate-blade', 30), w('scattered-mist', 23)])
    ).toEqual({ total: 30, setBy: 'twisted-fate-blade' });
  });

  it('is set by the second weapon when only it has a requirement', () => {
    expect(
      talentTarget(11, [w('pioneer-longsword', null), w('fallen-margrave', 14)])
    ).toEqual({ total: 14, setBy: 'fallen-margrave' });
  });

  it('is set by the first weapon on a tie', () => {
    expect(
      talentTarget(11, [
        w('wrathful-tyrants-horn', 23),
        w('scattered-mist', 23),
      ])
    ).toEqual({ total: 23, setBy: 'wrathful-tyrants-horn' });
  });

  it('is the base Talent when every requirement is at or below it', () => {
    expect(talentTarget(11, [w('a', 5), w('b', 11)])).toEqual({
      total: 11,
      setBy: null,
    });
  });

  it('is the base Talent with no weapons', () => {
    expect(talentTarget(11, [])).toEqual({ total: 11, setBy: null });
  });
});
