import { pgTable, text } from 'drizzle-orm/pg-core';

export const materials = pgTable('materials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export type MaterialRow = typeof materials.$inferSelect;
