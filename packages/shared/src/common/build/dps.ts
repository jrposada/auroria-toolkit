import { ClassDerivation } from '../../models/classes/class.ts';
import { ATTRIBUTE_KEYS, AttributeBlock } from './stats.ts';

export type DpsWeaponTest = {
  weaponAtk: number;
  damage: number;
  seconds: number;
};

export type DpsTest = {
  /** Attack read with the main weapon equipped. */
  attack: number;
  /** Attributes missing here default to the class base. */
  attributes: Partial<AttributeBlock>;
  main: DpsWeaponTest;
  swap: DpsWeaponTest;
};

export type DpsModelInput = {
  plan: AttributeBlock[];
  base: AttributeBlock;
  derivation: ClassDerivation;
  test: DpsTest;
  weaponAtk: { main: number | null; swap: number | null };
  /** ATK the compared gear adds over the gear the test was taken with. */
  gearAtkDelta: number;
};

export type DpsAtLevel = {
  mainAtk: number;
  swapAtk: number;
  main: number;
  swap: number;
};

export type DpsModel = { ok: boolean; at(level: number): DpsAtLevel };

/** Ported from `dpsModel` in docs/reference/warrior-planner.html. */
export function dpsModel({
  plan,
  base,
  derivation,
  test,
  weaponAtk,
  gearAtkDelta,
}: DpsModelInput): DpsModel {
  const perPoint = derivation.perPoint.attack ?? {};
  const statPart = test.attack - test.main.weaponAtk;
  const mainProjected = weaponAtk.main || test.main.weaponAtk;
  const swapProjected = weaponAtk.swap || test.swap.weaponAtk;
  const mainMeasured = test.main.damage / Math.max(0.1, test.main.seconds);
  const swapMeasured = test.swap.damage / Math.max(0.1, test.swap.seconds);
  const mainTested = statPart + test.main.weaponAtk;
  const swapTested = statPart + test.swap.weaponAtk;

  function at(level: number): DpsAtLevel {
    const totals = plan[level - 1];
    if (!totals) {
      throw new RangeError(
        `Level ${level} is outside the plan (1-${plan.length})`
      );
    }

    let stat = statPart;
    for (const attribute of ATTRIBUTE_KEYS) {
      const coefficient = perPoint[attribute];
      if (coefficient !== undefined) {
        stat +=
          coefficient *
          (totals[attribute] - (test.attributes[attribute] ?? base[attribute]));
      }
    }
    const mainAtk = stat + mainProjected + gearAtkDelta;
    const swapAtk = stat + swapProjected + gearAtkDelta;

    return {
      mainAtk,
      swapAtk,
      main: Math.max(0, (mainMeasured * mainAtk) / mainTested),
      swap: Math.max(0, (swapMeasured * swapAtk) / swapTested),
    };
  }

  return { at, ok: statPart > 0 && mainTested > 0 && swapTested > 0 };
}
