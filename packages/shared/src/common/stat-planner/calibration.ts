// Measured in game at 54 STR / 16 AGI (Nov 7, 2026)
export const CALIBRATION = {
  str: 54,
  agi: 16,
  attack: 100,
  critRating: 684,
  critDamageRating: 2642,
  penetration: 27,
} as const;

export const COEFFICIENTS = {
  attackPerStr: 1.3,
  attackPerAgi: 0.3,
  critRatingPerAgi: 29,
  critDamageRatingPerAgi: 36,
  penetrationPerStr: 0.1,
  penetrationPerAgi: 0.6,
  critRatingDivisor: 16000,
} as const;
