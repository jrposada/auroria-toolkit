import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { materials } from './material.ts';

export const recipes = pgTable('recipes', {
  id: text('id').primaryKey(),
  outputMaterialId: text('output_material_id')
    .notNull()
    .references(() => materials.id),
  outputQuantity: integer('output_quantity').notNull(),
  station: text('station').notNull(),
  profession: text('profession').notNull(),
  professionLevel: integer('profession_level').notNull(),
  goldCost: integer('gold_cost').notNull(),
});

export type RecipeRow = typeof recipes.$inferSelect;

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id),
    materialId: text('material_id')
      .notNull()
      .references(() => materials.id),
    quantity: integer('quantity').notNull(),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.materialId] })]
);

export type RecipeIngredientRow = typeof recipeIngredients.$inferSelect;
