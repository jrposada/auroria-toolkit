import { describe, expect, it } from 'vitest';

import {
  clampLevel,
  DEFAULTS,
  parsePlannerForm,
  plannerFormSchema,
  toPlannerValues,
} from './planner-form';

describe('Given the planner form', () => {
  it.each([null, undefined, 'x', 7, [], [1, 2]])(
    'when parsing %j then it is DEFAULTS',
    (raw) => {
      expect(parsePlannerForm(raw)).toEqual(DEFAULTS);
    }
  );

  it('when parsing then valid fields are kept and each invalid one is replaced by its default', () => {
    expect(
      parsePlannerForm({
        level: 27,
        ratio: '9',
        talentStartLevel: null,
        lsId: 5,
        gsId: 'fallen-margrave',
        lsAtk: NaN,
        lsDmg: '1200',
        gsSec: Infinity,
        traitPoints: 12,
        testInputsEdited: 'yes',
        extra: 1,
      })
    ).toEqual({
      ...DEFAULTS,
      level: 27,
      gsId: 'fallen-margrave',
      traitPoints: 12,
    });
  });

  it('when round-tripped through JSON then an empty (NaN) field comes back as its default', () => {
    const stored = JSON.parse(
      JSON.stringify({
        ...DEFAULTS,
        level: 33,
        lsAtk: NaN,
        testInputsEdited: true,
      })
    );

    expect(parsePlannerForm(stored)).toEqual({
      ...DEFAULTS,
      level: 33,
      testInputsEdited: true,
    });
  });

  it.each([
    [99, 40, 40],
    [0, 40, 1],
    [-3, 40, 1],
    [2.9, 40, 2],
    [40, 40, 40],
    [NaN, 40, 1],
    [7, 5, 5],
  ])('when clamping level %s to max %s then it is %s', (level, max, out) => {
    expect(clampLevel(level, max)).toBe(out);
  });

  it('when converting then values are clamped and converted', () => {
    expect(
      toPlannerValues(
        {
          ...DEFAULTS,
          level: 99,
          ratio: '0.5',
          talentStartLevel: 1,
          traitPoints: -4,
        },
        40
      )
    ).toMatchObject({
      level: 40,
      ratio: 0.5,
      talentStartLevel: 2,
      traitPoints: 0,
      test: {
        lsAtk: 41,
        lsDmg: 1200,
        lsSec: 10,
        gsAtk: 105,
        gsDmg: 1500,
        gsSec: 10,
        attack: 100,
        str: 54,
      },
    });
  });

  it('when converting then Talent start is capped at the max level and fractions are kept', () => {
    expect(
      toPlannerValues({ ...DEFAULTS, talentStartLevel: 55 }, 40)
        .talentStartLevel
    ).toBe(40);
    expect(
      toPlannerValues({ ...DEFAULTS, talentStartLevel: 29.5 }, 40)
        .talentStartLevel
    ).toBe(29.5);
  });

  it('when a number is NaN then the strict schema rejects it, which is what marks a field invalid', () => {
    expect(
      plannerFormSchema.safeParse({ ...DEFAULTS, lsAtk: NaN }).success
    ).toBe(false);
  });
});
