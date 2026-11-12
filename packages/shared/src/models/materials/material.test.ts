import { describe, expect, it } from 'vitest';

import { materialSchema } from './material.ts';

describe('materialSchema', () => {
  it('accepts a valid material', () => {
    const material = { id: 'iron-ore', name: 'Iron Ore' };

    expect(materialSchema.parse(material)).toEqual(material);
  });

  it('rejects an id that is not a slug', () => {
    expect(
      materialSchema.safeParse({ id: 'Iron Ore', name: 'Iron Ore' }).success
    ).toBe(false);
  });

  it('rejects a missing name', () => {
    expect(materialSchema.safeParse({ id: 'iron-ore' }).success).toBe(false);
  });
});
