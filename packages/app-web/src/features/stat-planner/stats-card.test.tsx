import { describe, expect, it } from 'vitest';

import { PlannerForm } from './planner-form';
import StatsCard from './stats-card';
import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';

const render = (form: Partial<PlannerForm>) =>
  renderPart(<StatsCard plan={planFor(form)} />, form);

describe('Given <StatsCard/>', () => {
  it('when at level 27 then it shows base, spent and total per stat with bars', () => {
    const html = render({ level: 27 });
    const text = textOf(html);

    expect(text).toContain('Stats at level 27');
    expect(text).toContain('78 / 78 points spent');
    expect(text).toContain('Strength 29 52 81');
    expect(text).toContain('Constitution 17 26 43');
    expect(text).toContain('Talent 11 0 11');
    expect(html.match(/<tr data-tone/g)).toHaveLength(6);
    expect(html).toContain('width:85%');
  });

  it('when at level 40 then every point is spent', () => {
    const text = textOf(render({ level: 40 }));

    expect(text).toContain('117 / 117 points spent');
    expect(text).toContain('Strength 29 66 95');
    expect(text).toContain('Constitution 17 39 56');
    expect(text).toContain('Talent 11 12 23');
  });

  it('when at level 30 then it matches the reference plan', () => {
    const text = textOf(render({ level: 30 }));

    expect(text).toContain('Strength 29 54 83');
    expect(text).toContain('Constitution 17 29 46');
    expect(text).toContain('Talent 11 4 15');
  });
});
