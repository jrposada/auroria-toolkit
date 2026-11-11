import type { WeaponsGetQuery } from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get';
import { and, asc, eq } from 'drizzle-orm';

import { getDatabase } from '../data/database.ts';
import type { WeaponRow } from '../data/models/weapon.ts';
import { weapons } from '../data/models/weapon.ts';
import ResourceNotFound from '../infrastructure/not-found-error.ts';

async function getWeapons(filters: WeaponsGetQuery): Promise<WeaponRow[]> {
  return getDatabase()
    .select()
    .from(weapons)
    .where(
      and(
        filters.class ? eq(weapons.classId, filters.class) : undefined,
        filters.type ? eq(weapons.type, filters.type) : undefined
      )
    )
    .orderBy(asc(weapons.type), asc(weapons.itemLevel), asc(weapons.id));
}

async function getWeaponById(id: string): Promise<WeaponRow> {
  const [row] = await getDatabase()
    .select()
    .from(weapons)
    .where(eq(weapons.id, id));

  if (!row) {
    throw new ResourceNotFound(`Weapon with id ${id} not found`);
  }

  return row;
}

export { getWeaponById, getWeapons };
