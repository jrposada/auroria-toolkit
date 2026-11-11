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
});
