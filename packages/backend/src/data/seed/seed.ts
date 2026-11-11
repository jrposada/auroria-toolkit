import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { classSchema } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import type { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { weaponSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import z from 'zod';

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
