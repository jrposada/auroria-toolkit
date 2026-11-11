import { describe, expect, it } from 'vitest';

import { weaponSchema } from './weapon.ts';
import { weaponsGetQuerySchema } from './weapons-get.ts';
import { weaponsGetByIdParamsSchema } from './weapons-get-by-id.ts';

const horn = {
  id: 'wrathful-tyrants-horn',
  name: "Wrathful Tyrant's Horn",
  class: 'warrior',
  type: 'Longsword',
  rarity: 'Legendary',
  itemLevel: 80,
  talentRequirement: 23,
  weight: 1.95,
  physicalAtk: null,
  magicAtk: null,
  damageShare: { physical: 70, magic: 30 },
  staggerTrigger: 100,
  exhaustTrigger: 100,
  lunastone: 'Fire ATK +10–67',
  extraStat: null,
  tempering: {
    steps: [
      {
        level: 1,
        bonusPct: 7.5,
        stonesPerTry: { count: 1, grade: 'Faint' },
        goldPerTry: 10000,
      },
      {
        level: 5,
        bonusPct: 37.5,
        stonesPerTry: { count: 40, grade: 'Faint' },
        goldPerTry: 63000,
      },
      {
        level: 10,
        bonusPct: 87.6,
        stonesPerTry: { count: 40, grade: 'Vivid' },
        goldPerTry: 525000,
      },
      {
        level: 15,
        bonusPct: 150,
        stonesPerTry: { count: 40, grade: 'Brilliant' },
        goldPerTry: 1093000,
      },
    ],
  },
  howToGet: 'Crafted (Smithing)',
  notes: null,
  sources: [{ url: 'https://example.com/weapons', checked: '2026-11-07' }],
};

function withSteps(steps: unknown[]) {
  return { ...horn, tempering: { steps } };
}

function rejects(weapon: unknown) {
  expect(weaponSchema.safeParse(weapon).success).toBe(false);
}

describe('weaponSchema', () => {
  it('accepts a valid weapon', () => {
    expect(weaponSchema.parse(horn)).toEqual(horn);
  });

  it('accepts a weapon that publishes no stones or gold', () => {
    const weapon = withSteps(
      horn.tempering.steps.map((step) => ({
        ...step,
        stonesPerTry: null,
        goldPerTry: null,
      }))
    );
    expect(weaponSchema.safeParse(weapon).success).toBe(true);
  });

  it('rejects a bad rarity', () => {
    rejects({ ...horn, rarity: 'Mythic' });
  });

  it('rejects a three-step tempering', () => {
    rejects(withSteps(horn.tempering.steps.slice(0, 3)));
  });

  it('rejects a tempering level outside 1, 5, 10, 15', () => {
    const [first, second, ...rest] = horn.tempering.steps;
    rejects(withSteps([first, { ...second, level: 6 }, ...rest]));
  });

  it('rejects a stone grade outside Faint, Vivid, Brilliant', () => {
    const [first, ...rest] = horn.tempering.steps;
    rejects(
      withSteps([
        { ...first, stonesPerTry: { count: 1, grade: 'Dull' } },
        ...rest,
      ])
    );
  });

  it('rejects an id that is not a slug', () => {
    rejects({ ...horn, id: "Wrathful Tyrant's Horn" });
  });

  it('rejects a class that is not a slug', () => {
    rejects({ ...horn, class: 'Warrior' });
  });

  it('rejects a fractional item level', () => {
    rejects({ ...horn, itemLevel: 80.5 });
  });

  it('rejects a weapon with no sources', () => {
    rejects({ ...horn, sources: [] });
  });

  it('rejects a source url that is not a url', () => {
    rejects({ ...horn, sources: [{ url: 'raiddex', checked: '2026-11-07' }] });
  });

  it('rejects a source date that is not an ISO date', () => {
    rejects({
      ...horn,
      sources: [{ url: 'https://example.com/weapons', checked: 'Nov 7, 2026' }],
    });
  });

  it('rejects a missing nullable field', () => {
    const withoutNotes = Object.fromEntries(
      Object.entries(horn).filter(([key]) => key !== 'notes')
    );
    rejects(withoutNotes);
  });
});

describe('weaponsGetQuerySchema', () => {
  it('accepts an empty query', () => {
    expect(weaponsGetQuerySchema.parse({})).toEqual({});
  });

  it('accepts class and type', () => {
    const query = { class: 'warrior', type: 'Longsword' };
    expect(weaponsGetQuerySchema.parse(query)).toEqual(query);
  });

  it('rejects a class that is not a slug', () => {
    expect(weaponsGetQuerySchema.safeParse({ class: 'Warrior' }).success).toBe(
      false
    );
  });
});

describe('weaponsGetByIdParamsSchema', () => {
  it('rejects an empty id', () => {
    expect(weaponsGetByIdParamsSchema.safeParse({ id: '' }).success).toBe(
      false
    );
  });
});
