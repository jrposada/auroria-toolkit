import { StatBlock } from './stats.ts';

export type PlanRatio = 3 | 2 | 1 | 0.5;

export type ProjectPlanInput = {
  baseStats: StatBlock;
  /** Strength points per Constitution point. */
  ratio: PlanRatio;
  talentStartLevel: number;
  talentTotal: number;
  maxLevel: number;
  pointsPerLevel: number;
};

/**
 * Stat totals for every level, index 0 being level 1.
 * Ported from `project` in docs/reference/warrior-planner.html.
 */
export function projectPlan({
  baseStats,
  ratio,
  talentStartLevel,
  talentTotal,
  maxLevel,
  pointsPerLevel,
}: ProjectPlanInput): StatBlock[] {
  const out: StatBlock[] = [{ ...baseStats }];
  const frac = ratio / (ratio + 1);
  let tot = { ...baseStats };
  let cumPoints = 0;
  let prevStrTarget = 0;

  for (let lv = 2; lv <= maxLevel; lv++) {
    cumPoints += pointsPerLevel;
    const strTarget = Math.round(cumPoints * frac);
    const strShare = Math.max(
      0,
      Math.min(pointsPerLevel, strTarget - prevStrTarget)
    );
    prevStrTarget = strTarget;
    const conShare = pointsPerLevel - strShare;

    // Talent comes out of the Strength share from the start level;
    // Constitution helps only if the last level would be missed
    const levelsLeft = maxLevel + 1 - lv;
    const start = Math.min(talentStartLevel, maxLevel);
    let deficit = Math.max(0, talentTotal - tot.tal);
    let fromStr = 0;
    let fromCon = 0;
    if (deficit > 0) {
      const strRate = Math.max(1, Math.round(pointsPerLevel * frac));
      // Strength share alone cannot close it by the last level
      const late = deficit > strRate * levelsLeft;
      if (lv >= start || deficit > pointsPerLevel * (levelsLeft - 1)) {
        fromStr = Math.min(deficit, strShare);
        deficit -= fromStr;
        if (late || ratio <= 1 || deficit > pointsPerLevel * (levelsLeft - 1)) {
          fromCon = Math.min(deficit, conShare);
        }
      }
    }

    tot = { ...tot };
    tot.str += strShare - fromStr;
    tot.con += conShare - fromCon;
    tot.tal += fromStr + fromCon;
    out.push(tot);
  }

  return out;
}

/** First level (1-based) whose Talent total meets the target. */
export function talentReachedAt(
  plan: StatBlock[],
  target: number
): number | null {
  const index = plan.findIndex((totals) => totals.tal >= target);
  return index === -1 ? null : index + 1;
}
