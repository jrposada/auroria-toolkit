import z from 'zod';

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const statSchema = z.number().int().nonnegative();
export const statBlockSchema = z.object({
  str: statSchema,
  agi: statSchema,
  con: statSchema,
  int: statSchema,
  tal: statSchema,
  end: statSchema,
});

export const attributeKeySchema = statBlockSchema.keyof();
export type AttributeKey = z.infer<typeof attributeKeySchema>;

// A stat outside this list fails validation, so data can't silently fall out of the maths.
export const STAT_IDS = [
  'physicalAtk',
  'magicAtk',
  'critRating',
  'critDamageRating',
  'penetration',
  'maxHp',
] as const;
export const statIdSchema = z.enum(STAT_IDS);
export type StatId = z.infer<typeof statIdSchema>;

export const statModifierSchema = z.object({
  stat: z.union([attributeKeySchema, statIdSchema]),
  value: z.number(),
});
export type StatModifier = z.infer<typeof statModifierSchema>;

export const DERIVED_KEYS = [
  'attack',
  'critRating',
  'critDamageRating',
  'penetration',
] as const;
export const derivedKeySchema = z.enum(DERIVED_KEYS);
export type DerivedKey = z.infer<typeof derivedKeySchema>;

export const classAllocationSchema = z
  .object({ primary: attributeKeySchema, secondary: attributeKeySchema })
  .refine((allocation) => allocation.primary !== allocation.secondary, {
    message: 'primary and secondary must differ',
  });
export type ClassAllocation = z.infer<typeof classAllocationSchema>;

// Coefficients are fractional, so statBlockSchema's integers don't fit.
const attributeCoefficientsSchema = z
  .object({
    str: z.number(),
    agi: z.number(),
    con: z.number(),
    int: z.number(),
    tal: z.number(),
    end: z.number(),
  })
  .partial()
  .strict();

export const classDerivationSchema = z.object({
  provisional: z.boolean(),
  reference: z.object({
    attributes: statBlockSchema.partial().strict(),
    gear: z.array(statModifierSchema),
    values: z.object({
      attack: z.number(),
      critRating: z.number(),
      critDamageRating: z.number(),
      penetration: z.number(),
    }),
  }),
  perPoint: z
    .object({
      attack: attributeCoefficientsSchema,
      critRating: attributeCoefficientsSchema,
      critDamageRating: attributeCoefficientsSchema,
      penetration: attributeCoefficientsSchema,
    })
    .partial()
    .strict(),
  critRatingDivisor: z.number().positive(),
});
export type ClassDerivation = z.infer<typeof classDerivationSchema>;

export const classSchema = z.object({
  id: slugSchema,
  name: z.string(),
  baseStats: statBlockSchema,
  pointsPerLevel: z.number().int().positive(),
  maxLevel: z.number().int().positive(),
  weaponTypes: z.array(z.string()),
  allocation: classAllocationSchema,
  derivation: classDerivationSchema,
});
export type Class = z.infer<typeof classSchema>;
