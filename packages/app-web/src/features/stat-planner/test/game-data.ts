import { Class, classSchema } from '@shared/models/classes/class';
import { Weapon, weaponSchema } from '@shared/models/weapons/weapon';

// The backend seed is what the browser gets from the API.
import classesSeed from '../../../../../backend/src/data/seed/classes.json';
import weaponsSeed from '../../../../../backend/src/data/seed/weapons.json';
import { PlannerForm } from '../planner-form';
import { computePlan, Plan } from '../use-plan';

export const WARRIOR: Class = classSchema.parse(classesSeed.items[0]);

// Sorted as the API sorts them: type, item level, id.
export const WEAPONS: Weapon[] = weaponSchema
  .array()
  .parse(weaponsSeed.items)
  .sort(
    (a, b) =>
      (a.type < b.type ? -1 : a.type > b.type ? 1 : 0) ||
      a.itemLevel - b.itemLevel ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );

export function planFor(
  form: Partial<PlannerForm> = {},
  weapons: Weapon[] = WEAPONS,
  cls: Class = WARRIOR
): Plan {
  return computePlan(form, cls, weapons);
}
