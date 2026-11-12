import z from 'zod';

import { Class, slugSchema } from '../../models/classes/class.ts';
import { DpsTest } from './dps.ts';
import { gearPieceSchema, gearSlotSchema } from './gear.ts';

export const BUILD_STORAGE_KEY = 'auroria-build-v1';

export const BUILD_RATIOS = ['3', '2', '1', '0.5'] as const;

const finite = z.number().finite();

const dpsWeaponTestSchema = z.object({
  weaponAtk: finite,
  damage: finite,
  seconds: finite,
});

export const dpsTestSchema = z.object({
  attack: finite,
  attributes: z
    .object({
      str: finite,
      agi: finite,
      con: finite,
      int: finite,
      tal: finite,
      end: finite,
    })
    .partial()
    .strict(),
  main: dpsWeaponTestSchema,
  swap: dpsWeaponTestSchema,
}) satisfies z.ZodType<DpsTest>;

export const buildSchema = z.object({
  version: z.literal(1),
  name: z.string(),
  classId: slugSchema,
  level: z.number().int().positive(),
  allocation: z.object({
    ratio: z.enum(BUILD_RATIOS),
    talentStartLevel: z.number().int(),
  }),
  gear: z.record(gearSlotSchema, gearPieceSchema),
  candidate: z
    .object({ slot: gearSlotSchema, piece: gearPieceSchema })
    .nullable(),
  dpsTest: dpsTestSchema,
});
export type Build = z.infer<typeof buildSchema>;

/** Defaults copied from the interim planner's DEFAULTS (app-web planner-form.ts). */
export function newBuild(cls: Pick<Class, 'id' | 'name'>): Build {
  return {
    version: 1,
    name: `New ${cls.name} build`,
    classId: cls.id,
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
  };
}

// TextEncoder + btoa/atob exist in browsers and in Node, so no Buffer.
export function encodeBuild(build: Build): string {
  const bytes = new TextEncoder().encode(JSON.stringify(build));
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export type DecodedBuild = { ok: true; build: Build } | { ok: false };

export function decodeBuild(
  text: string,
  classIds: readonly string[]
): DecodedBuild {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(text)) {
      return { ok: false };
    }

    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const parsed = buildSchema.safeParse(JSON.parse(json));
    if (!parsed.success || !classIds.includes(parsed.data.classId)) {
      return { ok: false };
    }

    return { ok: true, build: parsed.data };
  } catch {
    return { ok: false };
  }
}
