import { ClassAllocation } from '../../models/classes/class.ts';
import { AttributeBlock } from './stats.ts';

export function availablePoints(level: number, pointsPerLevel = 3): number {
  return (level - 1) * pointsPerLevel;
}

export type PlanRatio = 3 | 2 | 1 | 0.5;

export type ProjectPlanInput = {
  baseStats: AttributeBlock;
  allocation: ClassAllocation;
  /** Primary points per secondary point. */
  ratio: PlanRatio;
  talentStartLevel: number;
  talentTotal: number;
  maxLevel: number;
  pointsPerLevel: number;
};

/**
 * Attribute totals for every level, index 0 being level 1.
 * Ported from `project` in docs/reference/warrior-planner.html.
 */
export function projectPlan({
  baseStats,
  allocation,
  ratio,
  talentStartLevel,
  talentTotal,
  maxLevel,
  pointsPerLevel,
}: ProjectPlanInput): AttributeBlock[] {
  const out: AttributeBlock[] = [{ ...baseStats }];
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

    // Talent comes out of the primary share from the start level;
    // the secondary helps only if the last level would be missed
    const levelsLeft = maxLevel + 1 - lv;
    const start = Math.min(talentStartLevel, maxLevel);
    let deficit = Math.max(0, talentTotal - tot.tal);
    let fromStr = 0;
    let fromCon = 0;
    if (deficit > 0) {
      const strRate = Math.max(1, Math.round(pointsPerLevel * frac));
      // primary share alone cannot close it by the last level
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
    tot[allocation.primary] += strShare - fromStr;
    tot[allocation.secondary] += conShare - fromCon;
    tot.tal += fromStr + fromCon;
    out.push(tot);
  }

  return out;
}

/** First level (1-based) whose Talent total meets the target. */
export function talentReachedAt(
  plan: AttributeBlock[],
  target: number
): number | null {
  const index = plan.findIndex((totals) => totals.tal >= target);
  return index === -1 ? null : index + 1;
}

export type TalentTarget = { total: number; setBy: string | null };

export function talentTarget(
  baseTalent: number,
  items: { id: string; talentRequirement: number | null }[]
): TalentTarget {
  const total = Math.max(
    baseTalent,
    ...items.map((item) => item.talentRequirement ?? 0)
  );
  const setBy =
    total > baseTalent
      ? (items.find((item) => item.talentRequirement === total)?.id ?? null)
      : null;

  return { total, setBy };
}
