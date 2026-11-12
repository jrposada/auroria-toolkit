import { describe, expect, it } from 'vitest';

import NextLevelCard from './next-level-card';
import { PlannerForm } from './planner-form';
import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';

const render = (form: Partial<PlannerForm>) =>
  renderPart(<NextLevelCard plan={planFor(form)} />, form);

describe('Given <NextLevelCard/>', () => {
  it('when at level 1 then it shows the Strength and Constitution gains and the estimates', () => {
    const text = textOf(render({ level: 1 }));

    expect(text).toContain('Level 1 → 2');
    expect(text).toContain('+2 Strength');
    expect(text).toContain('+1 Constitution');
    expect(text).not.toContain('Talent level-up');
    expect(text).toContain('Spend these at the level-up screen.');
    expect(text).toContain(
      'Attack (same gear) 68 Crit chance 4.1% Crit damage rating 2642 Penetration 24.5'
    );
  });

  it('when at level 29 then the next level adds Talent with its note', () => {
    const html = render({ level: 29 });
    const text = textOf(html);

    expect(text).toContain('+1 Constitution');
    expect(text).toContain('+2 Talent');
    expect(text).toContain(
      'Talent level-up: working toward 23 for your weapons.'
    );
    expect(
      [...html.matchAll(/data-variant="([a-z]+)"/g)].map((match) => match[1])
    ).toEqual(['constitution', 'talent']);
  });

  it('when at level 40 then it is the max level in this plan', () => {
    const html = render({ level: 40 });
    const text = textOf(html);

    expect(text).toContain('Level 40');
    expect(text).not.toContain('→');
    expect(text).toContain('Max level in this plan');
    expect(text).toContain('All 117 points spent.');
    expect(html.match(/data-variant="neutral"/g)).toHaveLength(1);
    expect(text).toContain('Attack (same gear) 153');
  });

  it('then the calibration note is the reference text', () => {
    expect(textOf(render({}))).toContain(
      'Calibrated from your measurement at 54 Strength and 16 Agility: Attack 100, crit rating 684 (4.1%), crit damage 2642, pen 27. Strength adds 1.3 attack and 0.1 pen per point. Crit chance assumes rating ÷ (rating + 16,000). Gear changes all of these.'
    );
  });
});
