import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  baseStats: jsonb('base_stats').$type<Class['baseStats']>().notNull(),
  pointsPerLevel: integer('points_per_level').notNull(),
  maxLevel: integer('max_level').notNull(),
  weaponTypes: text('weapon_types').array().notNull(),
});

export type ClassRow = typeof classes.$inferSelect;
