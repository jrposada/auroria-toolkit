import { describe, expect, it } from 'vitest';

import { PlannerForm } from './planner-form';
import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';
import TotalsChart from './totals-chart';

const render = (form: Partial<PlannerForm>) =>
  renderPart(<TotalsChart plan={planFor(form)} />, form);
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('Given <TotalsChart/>', () => {
  it('when at level 27 then it draws three lines with end labels and a marker', () => {
    const html = render({ level: 27 });

    expect(count(html, 'data-series=')).toBe(3);
    expect(html).toContain('>STR 95<');
    expect(html).toContain('>CON 56<');
    expect(html).toContain('>TAL 23<');
    expect(count(html, 'data-marker=')).toBe(1);
    expect(count(html, 'data-marker-dot')).toBe(3);
    expect(html).toContain('<title>STR 81 at level 27</title>');
    expect(html).toContain(
      'aria-label="Strength, Constitution and Talent totals from level 1 to 40"'
    );
    expect(textOf(html)).toContain('Stat totals, level 1 to 40');
  });

  it('when Twisted Fate Blade is carried then the lines end at its plan', () => {
    const html = render({ lsId: 'twisted-fate-blade' });

    expect(html).toContain('>STR 88<');
    expect(html).toContain('>TAL 30<');
  });
});
