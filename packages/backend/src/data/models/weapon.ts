import type {
  Rarity,
  Weapon,
} from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
} from 'drizzle-orm/pg-core';

import { classes } from './class.ts';

export const weapons = pgTable(
  'weapons',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    classId: text('class_id')
      .notNull()
      .references(() => classes.id),
    type: text('type').notNull(),
    rarity: text('rarity').$type<Rarity>().notNull(),
    itemLevel: integer('item_level').notNull(),
    talentRequirement: integer('talent_requirement'),
    weight: real('weight').notNull(),
    physicalAtk: integer('physical_atk'),
    magicAtk: integer('magic_atk'),
    damageShare: jsonb('damage_share').$type<Weapon['damageShare']>().notNull(),
    staggerTrigger: real('stagger_trigger').notNull(),
    exhaustTrigger: real('exhaust_trigger').notNull(),
    lunastone: text('lunastone'),
    extraStat: text('extra_stat'),
    tempering: jsonb('tempering').$type<Weapon['tempering']>().notNull(),
    howToGet: text('how_to_get').notNull(),
    notes: text('notes'),
    sources: jsonb('sources').$type<Weapon['sources']>().notNull(),
  },
  (table) => [index('weapons_class_id_type_idx').on(table.classId, table.type)]
);

export type WeaponRow = typeof weapons.$inferSelect;
