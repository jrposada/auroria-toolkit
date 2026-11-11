import { Weapon } from '../../models/weapons/weapon.ts';

export type TalentTarget = { total: number; setBy: string | null };

export function talentTarget(
  baseTalent: number,
  weapons: Pick<Weapon, 'id' | 'talentRequirement'>[]
): TalentTarget {
  const total = Math.max(
    baseTalent,
    ...weapons.map((weapon) => weapon.talentRequirement ?? 0)
  );
  const setBy =
    total > baseTalent
      ? (weapons.find((weapon) => weapon.talentRequirement === total)?.id ??
        null)
      : null;

  return { total, setBy };
}
