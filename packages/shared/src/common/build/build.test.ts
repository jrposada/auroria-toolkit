import { describe, expect, it } from 'vitest';

import {
  Build,
  BUILD_STORAGE_KEY,
  buildSchema,
  decodeBuild,
  encodeBuild,
  newBuild,
} from './build.ts';
import { WARRIOR } from './test/classes.ts';
import { HELM, SWORD } from './test/gear.ts';

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const text = (value: string) => toBase64Url(new TextEncoder().encode(value));

const warrior = (over: Partial<Build> = {}): Build => ({
  ...newBuild(WARRIOR),
  ...over,
});

const geared = warrior({
  name: 'Épée ⚔',
  gear: {
    main: {
      ...SWORD,
      enhancement: 5,
      lunagemId: 'ruby',
      pinned: { critRating: 25 },
    },
    helmet: HELM,
  },
  candidate: { slot: 'helmet', piece: { ...HELM, lunagemId: 'ruby' } },
});

describe('newBuild', () => {
  it("uses today's planner defaults", () => {
    const build = newBuild(WARRIOR);

    expect(build).toEqual({
      version: 1,
      name: 'New Warrior build',
      classId: 'warrior',
      level: 1,
      allocation: { ratio: '2', talentStartLevel: 29 },
      gear: {},
      candidate: null,
      dpsTest: {
        attack: 100,
        attributes: { str: 54 },
        main: { weaponAtk: 41, damage: 1200, seconds: 10 },
        swap: { weaponAtk: 105, damage: 1500, seconds: 10 },
      },
    });
    expect(buildSchema.parse(build)).toEqual(build);
  });

  it('stores builds under their own key', () => {
    expect(BUILD_STORAGE_KEY).toBe('auroria-build-v1');
  });
});

describe('encodeBuild / decodeBuild', () => {
  it('round-trips through a share link', () => {
    const link = encodeBuild(geared);

    expect(link).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeBuild(link, ['warrior'])).toEqual({ ok: true, build: geared });
  });

  it.each([
    ['empty', ''],
    ['non-base64url', '!!!'],
    ['standard base64', 'abc+/='],
    ['whitespace', ` ${encodeBuild(geared)}`],
    ['not JSON', text('not json')],
    ['invalid UTF-8', toBase64Url(new Uint8Array([0xff, 0xfe]))],
    ['null', text('null')],
    ['an empty object', text('{}')],
  ])('rejects %s', (_, link) => {
    expect(decodeBuild(link, ['warrior'])).toEqual({ ok: false });
  });

  it('rejects another version', () => {
    const link = text(JSON.stringify({ ...geared, version: 2 }));

    expect(decodeBuild(link, ['warrior'])).toEqual({ ok: false });
  });

  it('rejects an unknown class', () => {
    expect(decodeBuild(encodeBuild(geared), ['mage'])).toEqual({ ok: false });
  });

  it('rejects an invalid piece', () => {
    const enhancement = {
      ...geared,
      gear: { main: { ...SWORD, enhancement: 3 } },
    };
    const slot = { ...geared, gear: { offhand: SWORD } };

    expect(decodeBuild(text(JSON.stringify(enhancement)), ['warrior'])).toEqual(
      { ok: false }
    );
    expect(decodeBuild(text(JSON.stringify(slot)), ['warrior'])).toEqual({
      ok: false,
    });
  });
});
