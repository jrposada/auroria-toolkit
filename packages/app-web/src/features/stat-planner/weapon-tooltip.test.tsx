import { Weapon } from '@shared/models/weapons/weapon';
import { describe, expect, it } from 'vitest';

import { PlannerForm } from './planner-form';
import { planFor, WEAPONS } from './test/game-data';
import { renderPart, textOf } from './test/render';
import WeaponTooltip from './weapon-tooltip';

const byId = (id: string): Weapon =>
  WEAPONS.find((weapon) => weapon.id === id)!;
const render = (id: string, form: Partial<PlannerForm> = {}) =>
  renderPart(<WeaponTooltip weapon={byId(id)} plan={planFor(form)} />, form);

describe('Given <WeaponTooltip/>', () => {
  it('when Twisted Fate Blade is not carried at level 40 then every section shows in order', () => {
    const html = render('twisted-fate-blade', { level: 40 });
    const text = textOf(html);

    expect(text).toMatch(
      /^Twisted Fate Blade Epic Longsword Class Warrior Item level 40 Physical ATK 92 Damage share 70% Phys 30% Magic Stagger Trigger 100% Exhaust Trigger 100% Weight 1\.65 Requires 30 Talent Your Talent at level 40 23 Plan reaches it not planned: click to carry it Tempering/
    );
    expect(text).toContain(
      'Bonus +13.3% +66.3% +154.7% +265% Stones 1 F 30 F 30 V 30 B Gold 4.5k 28.5k 238k 497k Per attempt.'
    );
    expect(text).toMatch(
      /Drop: Monstrous Tristan \(Lv 51\), 20% · Stardrift Hill completion XLGAMES: .*a fix is pending\.$/
    );
    expect(html.match(/data-section="[a-z]+"/g)).toEqual(
      ['stats', 'talent', 'tempering', 'source'].map(
        (section) => `data-section="${section}"`
      )
    );
    expect(html).toContain('data-met="false"');
    expect(html).not.toContain('Magic ATK');
  });

  it('when carried then the requirement is met and the plan reaches it', () => {
    const html = render('twisted-fate-blade', {
      level: 40,
      lsId: 'twisted-fate-blade',
    });

    expect(textOf(html)).toContain(
      'Your Talent at level 40 30 Plan reaches it level 38'
    );
    expect(html).toContain('data-met="true"');
    expect(html).not.toContain('data-met="false"');
  });

  it('when the weapon has no Talent requirement then it says none is listed', () => {
    const text = textOf(render('pioneer-longsword'));

    expect(text).toContain('Requires no Talent listed');
    expect(text).not.toContain('Your Talent');
  });

  it('then a Greatsword shows Magic ATK, its Lunastone and the 180/20 bar', () => {
    const html = render('royal-army-greatsword');
    const text = textOf(html);

    expect(text).toContain('Physical ATK 105 Magic ATK 12');
    expect(text).toContain('Lunastone Physical Crit Damage +136–157');
    expect(html).toContain('width:90%');
    expect(html).toContain('width:10%');
  });

  it('when stones and gold are unpublished then those rows are omitted and the bonus stat shows', () => {
    const html = render('corrupt-meliots-greatsword');

    expect(textOf(html)).toContain('Bonus Damage to Normal Monsters 16.3');
    // The tempering note mentions stones, so check the row headers.
    expect(html).not.toContain('>Stones<');
    expect(html).not.toContain('>Gold<');
    expect(render('twisted-fate-blade')).toContain('>Stones<');
  });

  it('then the only middle dot is in the how-to-get data', () => {
    const weapon = byId('twisted-fate-blade');
    const text = textOf(render(weapon.id));

    expect(text.replace(weapon.howToGet, '')).not.toContain('·');
  });
});
