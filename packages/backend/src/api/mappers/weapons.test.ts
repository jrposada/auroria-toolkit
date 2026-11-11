import { weaponSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';
import { describe, expect, it } from 'vitest';

import { parseSeed, toWeaponRow } from '../../data/seed/seed.ts';
import { toApiWeapon } from './weapons.ts';

describe('toApiWeapon', () => {
  it.each(parseSeed().weapons)(
    'maps the $id row back to the exact API weapon',
    (item) => {
      const api = toApiWeapon(toWeaponRow(item));

      expect(api).toEqual(item);
      // strict: `class` is present and the row's `classId` does not leak
      expect(weaponSchema.strict().parse(api)).toEqual(item);
    }
  );
});
