import { describe, expect, it } from 'vitest';

import DpsSection from './dps-section';
import { PlannerForm } from './planner-form';
import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';

const render = (form: Partial<PlannerForm> = {}) =>
  renderPart(<DpsSection plan={planFor(form)} />, form);

describe('Given <DpsSection/>', () => {
  it('when using the defaults then it shows tiles, verdict, per-Strength values, projections, badge and chart', () => {
    const html = render();
    const text = textOf(html);

    expect(text).toContain('Longsword vs Greatsword damage at level 1');
    expect(text).toContain('Example numbers: run the test and replace them');
    expect(text).toContain('Longsword DPS 81 Attack 68');
    expect(text).toContain('Greatsword DPS 120 Attack 132');
    expect(text).toContain('Greatsword ahead by 48% on a single target');
    expect(text).toContain('+1 Strength, Longsword damage +1.93%');
    expect(text).toContain('+1 Strength, Greatsword damage +0.99%');
    expect(text).toContain(
      "Projected with the tested Longsword (Wrathful Tyrant's Horn ATK not published)."
    );
    expect(text).toContain(
      'Projected with the tested Greatsword (Scattered Mist ATK not published).'
    );
    expect(html.match(/type="number"/g)).toHaveLength(8);
    expect(html.match(/data-series=/g)).toHaveLength(2);
    expect(html).toContain('>Longsword 184<');
    expect(html).toContain('>Greatsword 199<');
    expect(html).toContain('<title>Longsword 81 DPS at level 1</title>');
  });

  it('when a test input was edited then the example badge is hidden', () => {
    expect(textOf(render({ testInputsEdited: true }))).not.toContain(
      'Example numbers'
    );
  });

  it('when Twisted Fate Blade is carried at 40 then it projects with its ATK and the Longsword is ahead', () => {
    const text = textOf(render({ level: 40, lsId: 'twisted-fate-blade' }));

    expect(text).toContain('Projected with Twisted Fate Blade (ATK 92).');
    expect(text).toContain('Longsword DPS 234 Attack 195');
    expect(text).toContain('Longsword ahead by 19% on a single target');
    expect(text).toContain('+0.67%');
  });

  it('when the two weapons are within 2% then it reads about even', () => {
    const text = textOf(render({ gsDmg: 1010 }));

    expect(text).toContain('About even on a single target');
    expect(text).toContain('Greatsword DPS 81');
  });

  it('when test Attack is not above the Longsword ATK then the message replaces the chart and the tiles show dashes', () => {
    const html = render({ testAttack: 41 });
    const text = textOf(html);

    expect(text).toContain(
      "Test Attack must be higher than the Longsword's ATK. Check the test numbers."
    );
    expect(html).not.toContain('data-series=');
    expect(text).toContain('Longsword DPS –');
    expect(text).toContain('Greatsword DPS –');
    expect(text).toContain('+1 Strength, Longsword damage –');
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it('then the method text and the four test steps sit outside the card', () => {
    const html = render();
    const start = html.search(/<section[^>]*data-field-text/);
    const before = html.slice(0, start);
    const fieldText = html.slice(start);

    expect(start).toBeGreaterThan(0);
    // Every section opened before the field text is closed: it is not inside the card.
    expect(before.split('<section').length).toBe(
      before.split('</section>').length
    );
    expect(textOf(fieldText)).toContain('How the estimate works');
    expect(textOf(fieldText)).toContain('1.3 per Strength point');
    expect(textOf(fieldText)).toContain('The 2-minute test');
    expect(fieldText.match(/<li>/g)).toHaveLength(4);
  });
});
