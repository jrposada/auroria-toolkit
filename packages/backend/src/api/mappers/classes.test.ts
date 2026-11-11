import { classSchema } from '@jrposada/auroria-toolkit-shared/models/classes/class';
import { describe, expect, it } from 'vitest';

import { parseSeed, toClassRow } from '../../data/seed/seed.ts';
import { toApiClass } from './classes.ts';

describe('toApiClass', () => {
  it.each(parseSeed().classes)(
    'maps the $id row back to the exact API class',
    (item) => {
      const api = toApiClass(toClassRow(item));

      expect(api).toEqual(item);
      // strict: no row-only key leaks into the response
      expect(classSchema.strict().parse(api)).toEqual(item);
    }
  );
});
