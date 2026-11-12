import { describe, expect, it } from 'vitest';

import { resources } from './localization.ts';

describe('Given the localization resources', () => {
  it('then flat dotted keys are readable', () => {
    expect(resources.en.translation['app.name']).toBe('Auroria Toolkit');
  });

  it('then the unreachable-API message is the exact copy', () => {
    expect(resources.en.translation['data_state.error']).toBe(
      "Can't load game data. Check that the backend is running, then retry."
    );
  });

  it('then the empty crafting message is the exact copy', () => {
    expect(resources.en.translation['crafting.empty']).toBe(
      "Recipe data isn't in yet. Once it is, pick a recipe to see the materials and gold it takes."
    );
  });

  it('then the planner copy matches the reference', () => {
    const t = resources.en.translation;

    expect(t['stat_planner.dps.invalid']).toBe(
      "Test Attack must be higher than the Longsword's ATK. Check the test numbers."
    );
    expect(t['stat_planner.dps.example']).toBe(
      'Example numbers: run the test and replace them'
    );
    expect(t['stat_planner.next.max']).toBe('Max level in this plan');
    expect(t['stat_planner.tip.tempering_note']).toBe(
      'Per attempt. F/V/B = Faint, Vivid, Brilliant Weapon Tempering Stones. Success: 100% at +1, 20% at +5 and +10, 10% at +15.'
    );
  });

  it('then no planner string joins fragments with a middle dot', () => {
    const planner = Object.entries(resources.en.translation).filter(([key]) =>
      key.startsWith('stat_planner.')
    );

    expect(planner.filter(([, value]) => value.includes('·'))).toEqual([]);
  });
});
