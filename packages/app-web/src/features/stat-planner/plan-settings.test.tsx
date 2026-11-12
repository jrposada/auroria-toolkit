import { describe, expect, it } from 'vitest';

import PlanSettings from './plan-settings';
import { WARRIOR } from './test/game-data';
import { renderPart, textOf } from './test/render';

describe('Given <PlanSettings/>', () => {
  const html = renderPart(<PlanSettings cls={WARRIOR} />);

  it('then it is a details panel summarised as Plan settings', () => {
    expect(html).toMatch(/<summary[^>]*>Plan settings<\/summary>/);
  });

  it('then it offers the four ratios in order', () => {
    expect(
      [...html.matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)].map(
        (match) => [match[1], match[2]]
      )
    ).toEqual([
      ['3', '3 : 1 (more damage)'],
      ['2', '2 : 1 (recommended)'],
      ['1', '1 : 1'],
      ['0.5', '1 : 2 (more survival)'],
    ]);
  });

  it('then the Talent start level is limited to 2 through the max level', () => {
    expect(html).toMatch(/<input[^>]*type="number"[^>]*min="2"[^>]*max="40"/);
  });

  it('then the hint quotes the class base stats', () => {
    expect(textOf(html)).toContain(
      'Warrior base stats at level 1: STR 29, AGI 16, CON 17, INT 10, TAL 11, END 7. From the start level, Talent is taken out of the Strength share until it reaches the weapon requirement. If that would miss level 40, Constitution points are used too.'
    );
  });

  it('then it has a reset button', () => {
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>Reset to defaults</);
  });
});
