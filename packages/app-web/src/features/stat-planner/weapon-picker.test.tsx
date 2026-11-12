import { describe, expect, it } from 'vitest';

import { PlannerForm } from './planner-form';
import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';
import WeaponPicker from './weapon-picker';

const render = (slot: 'ls' | 'gs', form: Partial<PlannerForm> = {}) =>
  renderPart(<WeaponPicker slot={slot} plan={planFor(form)} />, form);
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('Given <WeaponPicker/>', () => {
  it('when showing Longswords then there are ten radios in item-level order, the default checked and the only tab stop', () => {
    const html = render('ls');

    expect(html).toMatch(
      /role="radiogroup"[^>]*aria-label="Longsword"|aria-label="Longsword"[^>]*role="radiogroup"/
    );
    expect(
      [...html.matchAll(/data-weapon="([^"]+)"/g)].map((match) => match[1])
    ).toEqual(planFor().weapons.ls.map((weapon) => weapon.id));
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(textOf(html)).toContain("Wrathful Tyrant's Horn needs 23 Talent");
  });

  it('when showing Greatswords then there are five', () => {
    const html = render('gs');

    expect(count(html, 'role="radio"')).toBe(5);
    expect(textOf(html)).toContain('Scattered Mist needs 23 Talent');
  });

  it('when at level 1 then every tile needing more than 11 Talent is marked short', () => {
    expect(count(render('ls'), 'data-short')).toBe(4);
    expect(count(render('ls', { level: 40 }), 'data-short')).toBe(1);
  });

  it('when the carried weapon has no requirement then the line says so', () => {
    expect(textOf(render('ls', { lsId: 'pioneer-longsword' }))).toContain(
      'Pioneer Longsword no Talent requirement'
    );
  });

  it('then no tooltip and no inline detail render until asked', () => {
    const html = render('ls');

    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('data-weapon-detail');
  });

  it('when there are no weapons then the radiogroup renders with no tiles', () => {
    const html = renderPart(<WeaponPicker slot="ls" plan={planFor({}, [])} />);

    expect(html).toContain('role="radiogroup"');
    expect(html).not.toContain('role="radio"');
  });
});
