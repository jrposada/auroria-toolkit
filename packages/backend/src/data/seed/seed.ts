import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { classSchema } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import type { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { weaponSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { notInArray } from 'drizzle-orm';
import z from 'zod';

import Logger from '../../infrastructure/logger.ts';
import { getDatabase } from '../database.ts';
import type { ClassRow } from '../models/class.ts';
import { classes } from '../models/class.ts';
import type { WeaponRow } from '../models/weapon.ts';
import { weapons } from '../models/weapon.ts';
import classesFile from './classes.json' with { type: 'json' };
import weaponsFile from './weapons.json' with { type: 'json' };

export type Seed = {
  classes: Class[];
  weapons: Weapon[];
};

export function parseSeedFile<TItem>(
  itemSchema: z.ZodType<TItem>,
  file: unknown
): TItem[] {
  return z
    .object({
      version: z.number().int().positive(),
      items: z.array(itemSchema),
    })
    .parse(file).items;
}

export function parseSeed(): Seed {
  return {
    classes: parseSeedFile(classSchema, classesFile),
    weapons: parseSeedFile(weaponSchema, weaponsFile),
  };
}

export function toClassRow(item: Class): ClassRow {
  return {
    id: item.id,
    name: item.name,
    baseStats: item.baseStats,
    pointsPerLevel: item.pointsPerLevel,
    maxLevel: item.maxLevel,
    weaponTypes: item.weaponTypes,
  };
}

export function toWeaponRow(item: Weapon): WeaponRow {
  return {
    id: item.id,
    name: item.name,
    classId: item.class,
    type: item.type,
    rarity: item.rarity,
    itemLevel: item.itemLevel,
    talentRequirement: item.talentRequirement,
    weight: item.weight,
    physicalAtk: item.physicalAtk,
    magicAtk: item.magicAtk,
    damageShare: item.damageShare,
    staggerTrigger: item.staggerTrigger,
    exhaustTrigger: item.exhaustTrigger,
    lunastone: item.lunastone,
    extraStat: item.extraStat,
    tempering: item.tempering,
    howToGet: item.howToGet,
    notes: item.notes,
    sources: item.sources,
  };
}

/**
 * Makes the tables mirror the seed: every item is upserted by id and rows
 * whose id is no longer in the seed are deleted, all in one transaction.
 */
export async function seedDatabase(seed: Seed): Promise<void> {
  const classIds = seed.classes.map((item) => item.id);
  const weaponIds = seed.weapons.map((item) => item.id);

  await getDatabase().transaction(async (tx) => {
    // Parents before children for upserts, children before parents for deletes.
    for (const row of seed.classes.map(toClassRow)) {
      await tx
        .insert(classes)
        .values(row)
        .onConflictDoUpdate({ target: classes.id, set: row });
    }
    for (const row of seed.weapons.map(toWeaponRow)) {
      await tx
        .insert(weapons)
        .values(row)
        .onConflictDoUpdate({ target: weapons.id, set: row });
    }

    // An empty list means "delete every row"; NOT IN () is not valid SQL.
    await tx
      .delete(weapons)
      .where(weaponIds.length ? notInArray(weapons.id, weaponIds) : undefined);
    await tx
      .delete(classes)
      .where(classIds.length ? notInArray(classes.id, classIds) : undefined);
  });

  Logger.info(
    `Seeded ${seed.classes.length} classes, ${seed.weapons.length} weapons`
  );
}
