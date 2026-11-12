import { materialSchema } from '@jrposada/auroria-toolkit-shared/models/materials/material';
import { describe, expect, it } from 'vitest';

import { MATERIALS } from '../../data/seed/crafting-fixtures.ts';
import { toMaterialRow } from '../../data/seed/seed.ts';
import { toApiMaterial } from './materials.ts';

describe('toApiMaterial', () => {
  it.each(MATERIALS)(
    'maps the $id row back to the exact API material',
    (item) => {
      const api = toApiMaterial(toMaterialRow(item));

      expect(api).toEqual(item);
      // strict: no row-only key leaks into the response
      expect(materialSchema.strict().parse(api)).toEqual(item);
    }
  );
});
