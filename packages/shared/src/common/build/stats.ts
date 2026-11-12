import {
  AttributeKey,
  attributeKeySchema,
  StatId,
} from '../../models/classes/class.ts';

export {
  type AttributeKey,
  DERIVED_KEYS,
  type DerivedKey,
  STAT_IDS,
  type StatId,
  type StatModifier,
} from '../../models/classes/class.ts';

export const ATTRIBUTE_KEYS = attributeKeySchema.options;

export type AttributeBlock = Record<AttributeKey, number>;

export type RandomStat = {
  stat: AttributeKey | StatId;
  min: number;
  max: number;
};
