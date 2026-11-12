import { describe, expect, it } from 'vitest';

import TalentTarget from './talent-target';
import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';
import { Plan } from './use-plan';

const text = (plan: Plan) => textOf(renderPart(<TalentTarget plan={plan} />));

describe('Given <TalentTarget/>', () => {
  it('when using the defaults then the horn sets 23, reached at 34', () => {
    expect(text(planFor())).toBe(
      "Talent at level 40 23 Set by Wrathful Tyrant's Horn Reached at level 34"
    );
  });

  it('when Twisted Fate Blade is carried then it sets 30, reached at 38', () => {
    expect(text(planFor({ lsId: 'twisted-fate-blade' }))).toBe(
      'Talent at level 40 30 Set by Twisted Fate Blade Reached at level 38'
    );
  });

  it('when neither weapon has a requirement then base Talent covers both', () => {
    expect(
      text(
        planFor({ lsId: 'pioneer-longsword', gsId: 'royal-army-greatsword' })
      )
    ).toBe('Talent at level 40 11 Base Talent (11) covers both weapons');
  });

  it('when the plan never reaches the target then it says so', () => {
    const plan = planFor();
    const unreached = { ...plan, target: { ...plan.target, reachedAt: null } };

    expect(text(unreached)).toContain('Not reached by level 40');
  });

  it('then nothing is joined with a middle dot', () => {
    expect(text(planFor())).not.toContain('·');
    expect(text(planFor({ lsId: 'pioneer-longsword' }))).not.toContain('·');
  });
});
