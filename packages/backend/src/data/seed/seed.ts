import type { Class } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { classSchema } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import type { Material } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import { materialSchema } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import type { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import { recipeSchema } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';
import type { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { weaponSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { eq, notInArray } from 'drizzle-orm';
import z from 'zod';

import Logger from '../../infrastructure/logger.ts';
import { getDatabase } from '../database.ts';
import type { ClassRow } from '../models/class.ts';
import { classes } from '../models/class.ts';
import type { MaterialRow } from '../models/material.ts';
import { materials } from '../models/material.ts';
import type { RecipeIngredientRow, RecipeRow } from '../models/recipe.ts';
import { recipeIngredients, recipes } from '../models/recipe.ts';
import type { WeaponRow } from '../models/weapon.ts';
import { weapons } from '../models/weapon.ts';
import classesFile from './classes.json' with { type: 'json' };
import materialsFile from './materials.json' with { type: 'json' };
import recipesFile from './recipes.json' with { type: 'json' };
import weaponsFile from './weapons.json' with { type: 'json' };

export type Seed = {
  classes: Class[];
  weapons: Weapon[];
  materials: Material[];
  recipes: Recipe[];
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

/**
 * Stops a broken seed before the database is touched: the foreign keys would
 * catch a missing material too, but only mid-transaction and without naming
 * the recipe.
 */
export function assertRecipeReferences(
  seed: Pick<Seed, 'materials' | 'recipes'>
): void {
  const materialIds = new Set(seed.materials.map((item) => item.id));

  for (const recipe of seed.recipes) {
    const listed = new Set<string>();

    for (const { materialId } of [recipe.output, ...recipe.ingredients]) {
      if (!materialIds.has(materialId)) {
        throw new Error(
          `Recipe ${recipe.id} references missing material ${materialId}`
        );
      }
    }
    for (const { materialId } of recipe.ingredients) {
      if (listed.has(materialId)) {
        throw new Error(
          `Recipe ${recipe.id} lists material ${materialId} more than once`
        );
      }
      listed.add(materialId);
    }
  }
}

export function parseSeed(): Seed {
  const seed = {
    classes: parseSeedFile(classSchema, classesFile),
    weapons: parseSeedFile(weaponSchema, weaponsFile),
    materials: parseSeedFile(materialSchema, materialsFile),
    recipes: parseSeedFile(recipeSchema, recipesFile),
  };
  assertRecipeReferences(seed);

  return seed;
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

export function toMaterialRow(item: Material): MaterialRow {
  return {
    id: item.id,
    name: item.name,
  };
}

export function toRecipeRow(item: Recipe): RecipeRow {
  return {
    id: item.id,
    outputMaterialId: item.output.materialId,
    outputQuantity: item.output.quantity,
    station: item.station,
    profession: item.profession,
    professionLevel: item.professionLevel,
    goldCost: item.goldCost,
  };
}

export function toRecipeIngredientRows(item: Recipe): RecipeIngredientRow[] {
  return item.ingredients.map((ingredient) => ({
    recipeId: item.id,
    materialId: ingredient.materialId,
    quantity: ingredient.quantity,
  }));
}

/**
 * Makes the tables mirror the seed: every item is upserted by id and rows
 * whose id is no longer in the seed are deleted, all in one transaction.
 */
export async function seedDatabase(seed: Seed): Promise<void> {
  const classIds = seed.classes.map((item) => item.id);
  const weaponIds = seed.weapons.map((item) => item.id);
  const materialIds = seed.materials.map((item) => item.id);
  const recipeIds = seed.recipes.map((item) => item.id);

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
    for (const row of seed.materials.map(toMaterialRow)) {
      await tx
        .insert(materials)
        .values(row)
        .onConflictDoUpdate({ target: materials.id, set: row });
    }
    for (const item of seed.recipes) {
      const row = toRecipeRow(item);
      const ingredientRows = toRecipeIngredientRows(item);

      await tx
        .insert(recipes)
        .values(row)
        .onConflictDoUpdate({ target: recipes.id, set: row });
      // Replaced wholesale, so an ingredient dropped from the seed is dropped here.
      await tx
        .delete(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, item.id));
      if (ingredientRows.length) {
        await tx.insert(recipeIngredients).values(ingredientRows);
      }
    }

    // An empty list means "delete every row"; NOT IN () is not valid SQL.
    await tx
      .delete(recipeIngredients)
      .where(
        recipeIds.length
          ? notInArray(recipeIngredients.recipeId, recipeIds)
          : undefined
      );
    await tx
      .delete(recipes)
      .where(recipeIds.length ? notInArray(recipes.id, recipeIds) : undefined);
    await tx
      .delete(materials)
      .where(
        materialIds.length ? notInArray(materials.id, materialIds) : undefined
      );
    await tx
      .delete(weapons)
      .where(weaponIds.length ? notInArray(weapons.id, weaponIds) : undefined);
    await tx
      .delete(classes)
      .where(classIds.length ? notInArray(classes.id, classIds) : undefined);
  });

  Logger.info(
    `Seeded ${seed.classes.length} classes, ${seed.weapons.length} weapons, ${seed.materials.length} materials, ${seed.recipes.length} recipes`
  );
}
