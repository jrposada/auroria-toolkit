import { CALIBRATION, COEFFICIENTS } from './calibration.ts';
import { StatBlock } from './stats.ts';

export type DerivedStats = {
  attack: number;
  critPct: number;
  critDamageRating: number;
  penetration: number;
};

export function derivedStats(totals: StatBlock): DerivedStats {
  const dStr = totals.str - CALIBRATION.str;
  const dAgi = totals.agi - CALIBRATION.agi;
  const critRating =
    CALIBRATION.critRating + COEFFICIENTS.critRatingPerAgi * dAgi;

  return {
    attack:
      CALIBRATION.attack +
      COEFFICIENTS.attackPerStr * dStr +
      COEFFICIENTS.attackPerAgi * dAgi,
    critPct: (critRating / (critRating + COEFFICIENTS.critRatingDivisor)) * 100,
    critDamageRating:
      CALIBRATION.critDamageRating + COEFFICIENTS.critDamageRatingPerAgi * dAgi,
    penetration:
      CALIBRATION.penetration +
      COEFFICIENTS.penetrationPerStr * dStr +
      COEFFICIENTS.penetrationPerAgi * dAgi,
  };
}
