import { describe, expect, it } from 'vitest';

import InGameChecks from './in-game-checks';
import { renderPart, textOf } from './test/render';

describe('Given <InGameChecks/>', () => {
  const html = renderPart(<InGameChecks />);
  const text = textOf(html);

  it('then it lists the four checks under its heading', () => {
    expect(html).toMatch(/<h2[^>]*>Checks to run in game<\/h2>/);
    expect(html.match(/<li>/g)).toHaveLength(4);
    expect(text).toContain(
      'Sharpwake crit. At 3 Sharpwake stacks (from parries), read your crit chance. If it is 20% or more, crit triggers fire often without Agility.'
    );
    expect(text).toContain(
      'Survival. Dying in boss fights or PvP? Switch the ratio to 1 : 1 or 1 : 2 for a few levels.'
    );
  });

  it('then it says when the stat effects were measured and links the patch notices', () => {
    expect(text).toContain(
      'Stat effects measured on your character on Nov 7, 2026. Early Access balance may change.'
    );
    expect(html).toMatch(
      /<a href="https:\/\/archeagebuilds.com\/servers\/"[^>]*>Server and patch notices<\/a>/
    );
  });

  it('then it sits on the field, not in a card', () => {
    expect(html).toMatch(/^<section[^>]*data-field-text/);
  });
});
