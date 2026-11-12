import { asc } from 'drizzle-orm';

import { getDatabase } from '../data/database.ts';
import type { MaterialRow } from '../data/models/material.ts';
import { materials } from '../data/models/material.ts';

async function getMaterials(): Promise<MaterialRow[]> {
  return getDatabase().select().from(materials).orderBy(asc(materials.id));
}

export { getMaterials };
