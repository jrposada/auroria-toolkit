import { Weapon } from '@shared/models/weapons/weapon';
import { describe, expect, it } from 'vitest';

import { WEAPONS } from './test/game-data';
import { renderPart, textOf } from './test/render';
import WeaponTile from './weapon-tile';

const byId = (id: string): Weapon =>
  WEAPONS.find((weapon) => weapon.id === id)!;
const noop = { onSelect: () => {}, onShow: () => {} };

const LONGSWORD_BLADE = 'M10 22 L24 6 L27 5 L26 8 L12 24 Z';
const GREATSWORD_BLADE = 'M9 23 L21 5 L27 5 L27 11 L11 25 Z';

describe('Given <WeaponTile/>', () => {
  const html = renderPart(
    <WeaponTile
      weapon={byId('twisted-fate-blade')}
      checked={false}
      short
      tabStop={false}
      {...noop}
    />
  );

  it('then it is a radio labelled as the reference builds it', () => {
    expect(html).toContain('role="radio"');
    expect(html).toContain('aria-checked="false"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain(
      'aria-label="Twisted Fate Blade, Epic, item level 40, requires 30 Talent"'
    );
    expect(html).toContain('--rc:var(--r-epic)');
    expect(html).toContain('data-short');
    expect(textOf(html)).toBe('30 Twisted Fate Blade iLv 40');
  });

  it('when the weapon has no requirement then it has no badge and a shorter label', () => {
    const plain = renderPart(
      <WeaponTile
        weapon={byId('pioneer-longsword')}
        checked={false}
        short={false}
        tabStop={false}
        {...noop}
      />
    );

    expect(plain).toContain(
      'aria-label="Pioneer Longsword, Common, item level 1"'
    );
    expect(textOf(plain)).toBe('Pioneer Longsword iLv 1');
  });

  it('when checked and the tab stop then it says so', () => {
    const checked = renderPart(
      <WeaponTile
        weapon={byId('wrathful-tyrants-horn')}
        checked
        short={false}
        tabStop
        {...noop}
      />
    );

    expect(checked).toContain('aria-checked="true"');
    expect(checked).toContain('tabindex="0"');
    expect(checked).not.toContain('data-short');
  });

  it('then it draws the Greatsword blade for a Greatsword and the Longsword blade otherwise', () => {
    const greatsword = renderPart(
      <WeaponTile
        weapon={byId('scattered-mist')}
        checked={false}
        short={false}
        tabStop={false}
        {...noop}
      />
    );

    expect(greatsword).toContain(`d="${GREATSWORD_BLADE}"`);
    expect(greatsword).not.toContain(LONGSWORD_BLADE);
    expect(html).toContain(`d="${LONGSWORD_BLADE}"`);
    expect(html).not.toContain(GREATSWORD_BLADE);
  });

  it('then it uses no image', () => {
    expect(html).not.toMatch(/<img|url\(/);
  });
});
