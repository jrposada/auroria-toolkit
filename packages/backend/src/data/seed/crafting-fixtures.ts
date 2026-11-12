import type { Material } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import type { Recipe } from '@jrposada/auroria-toolkit-shared/models/recipes/recipe';

// Invented placeholders for tests, not game data. Ingredients are listed in
// materialId order, the order the API returns them in.
export const MATERIALS: Material[] = [
  { id: 'charcoal', name: 'Charcoal' },
  { id: 'iron-ingot', name: 'Iron Ingot' },
  { id: 'iron-ore', name: 'Iron Ore' },
  { id: 'steel-ingot', name: 'Steel Ingot' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'iron-ingot-bulk-smelting',
    output: { materialId: 'iron-ingot', quantity: 5 },
    station: 'Smelter',
    profession: 'Metalwork',
    professionLevel: 10,
    goldCost: 50,
    ingredients: [
      { materialId: 'charcoal', quantity: 2 },
      { materialId: 'iron-ore', quantity: 12 },
    ],
  },
  {
    id: 'iron-ingot-smelting',
    output: { materialId: 'iron-ingot', quantity: 1 },
    station: 'Smelter',
    profession: 'Metalwork',
    professionLevel: 0,
    goldCost: 0,
    ingredients: [{ materialId: 'iron-ore', quantity: 3 }],
  },
  {
    id: 'steel-ingot-forging',
    output: { materialId: 'steel-ingot', quantity: 1 },
    station: 'Forge',
    profession: 'Metalwork',
    professionLevel: 20,
    goldCost: 120,
    ingredients: [
      { materialId: 'charcoal', quantity: 1 },
      { materialId: 'iron-ingot', quantity: 2 },
    ],
  },
];
