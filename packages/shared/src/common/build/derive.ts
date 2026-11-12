import { ClassDerivation } from '../../models/classes/class.ts';
import {
  ATTRIBUTE_KEYS,
  AttributeBlock,
  DERIVED_KEYS,
  DerivedKey,
  StatId,
  StatModifier,
} from './stats.ts';

export type DerivedStats = {
  attack: number;
  critPct: number;
  critDamageRating: number;
  penetration: number;
};

const GEAR_STAT: Record<DerivedKey, StatId> = {
  attack: 'physicalAtk',
  critRating: 'critRating',
  critDamageRating: 'critDamageRating',
  penetration: 'penetration',
};

function sumOf(gear: StatModifier[], stat: StatId): number {
  return gear.reduce(
    (sum, modifier) => (modifier.stat === stat ? sum + modifier.value : sum),
    0
  );
}

// Summed as reference + (gear − reference gear) + per-point terms, so with the
// reference gear the middle term is exactly 0 and results match the old
// gear-free formula bit for bit.
function fromReference(
  attributes: AttributeBlock,
  derivation: ClassDerivation,
  gear: StatModifier[]
): Record<DerivedKey, number> {
  const { reference, perPoint } = derivation;
  const out = {} as Record<DerivedKey, number>;

  for (const key of DERIVED_KEYS) {
    const stat = GEAR_STAT[key];
    let value =
      reference.values[key] + (sumOf(gear, stat) - sumOf(reference.gear, stat));
    for (const attribute of ATTRIBUTE_KEYS) {
      const coefficient = perPoint[key]?.[attribute];
      if (coefficient !== undefined) {
        value +=
          coefficient *
          (attributes[attribute] -
            (reference.attributes[attribute] ?? attributes[attribute]));
      }
    }
    out[key] = value;
  }

  return out;
}

export function bareStats(
  attributes: AttributeBlock,
  derivation: ClassDerivation
): Record<DerivedKey, number> {
  return fromReference(attributes, derivation, []);
}

export function derivedStats(
  attributes: AttributeBlock,
  derivation: ClassDerivation,
  gear: StatModifier[]
): DerivedStats {
  const stats = fromReference(attributes, derivation, gear);

  return {
    attack: stats.attack,
    critPct:
      (stats.critRating / (stats.critRating + derivation.critRatingDivisor)) *
      100,
    critDamageRating: stats.critDamageRating,
    penetration: stats.penetration,
  };
}
