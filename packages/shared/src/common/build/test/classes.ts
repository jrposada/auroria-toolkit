import { readFileSync } from 'node:fs';

import { Class, classSchema } from '../../../models/classes/class.ts';

// Read rather than imported: shared's tsconfig only includes src/**.
const seed = JSON.parse(
  readFileSync(
    new URL(
      '../../../../../backend/src/data/seed/classes.json',
      import.meta.url
    ),
    'utf8'
  )
) as { items: unknown[] };

export const WARRIOR: Class = classSchema.parse(seed.items[0]);

export const MAGE: Class = classSchema.parse({
  ...WARRIOR,
  id: 'mage',
  name: 'Mage',
  allocation: { primary: 'int', secondary: 'end' },
  derivation: {
    provisional: true,
    reference: {
      attributes: { int: 20 },
      gear: [],
      values: {
        attack: 50,
        critRating: 0,
        critDamageRating: 0,
        penetration: 0,
      },
    },
    perPoint: { attack: { int: 2, con: 5 } },
    critRatingDivisor: 1000,
  },
});
