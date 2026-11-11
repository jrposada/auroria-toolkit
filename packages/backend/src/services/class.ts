import { asc, eq } from 'drizzle-orm';

import { getDatabase } from '../data/database.ts';
import type { ClassRow } from '../data/models/class.ts';
import { classes } from '../data/models/class.ts';
import ResourceNotFound from '../infrastructure/not-found-error.ts';

async function getClasses(): Promise<ClassRow[]> {
  return getDatabase().select().from(classes).orderBy(asc(classes.id));
}

async function getClassById(id: string): Promise<ClassRow> {
  const [row] = await getDatabase()
    .select()
    .from(classes)
    .where(eq(classes.id, id));

  if (!row) {
    throw new ResourceNotFound(`Class with id ${id} not found`);
  }

  return row;
}

export { getClassById, getClasses };
