export type TraitPhase = {
  title: string;
  nodes: string;
  description: string;
  cost: number;
};

// No endpoint serves trait phases, so they are copied from the reference.
export const PHASES: TraitPhase[] = [
  {
    title: 'Parry → Sharpwake',
    nodes:
      'Parry, Counterattack, Longsword Proficiency, Swift Flurry, Sharpwake',
    description:
      'Parries grant Sharpwake: crit and damage up for 20 s, 3 stacks. Your main crit source.',
    cost: 5,
  },
  {
    title: 'Charge → Pursuit',
    nodes: 'Horizontal Slash, Charge, Pursuit, Pursuit - Root',
    description:
      'Gap closer with a 3 s root and Foresight. Keeps you on bosses that move.',
    cost: 4,
  },
  {
    title: 'Lifeflame sustain',
    nodes: 'Whirlwind Slash, Lifeflame, Heavy Kick',
    description: 'Closing Slash heals based on damage dealt.',
    cost: 3,
  },
  {
    title: 'Bloodstorm',
    nodes: 'Annihilating Slash, Bloodstorm',
    description: 'Area damage and Bleed, paid with HP instead of SP.',
    cost: 5,
  },
  {
    title: 'Counter damage',
    nodes:
      'Twin Slash, Slaughter, Closing Slash Combo, Breakthrough, Counterattack Mastery',
    description:
      'Counters hit harder and build stun. Breakthrough spends Sharpwake for an extra hit.',
    cost: 7,
  },
  {
    title: 'Blood core → Crimson Surge',
    nodes:
      'Bloodstorm Mastery I–II, Lightning Speed, Frenzy, Wind ATK, Hemorrhage, Bloodforge, Bloodthirst, Crimson Surge, Crimson Covenant',
    description:
      'Bloodforge makes your skills heal you. Completes the sustain loop.',
    cost: 20,
  },
  {
    title: "Parry burst → Mind's Eye",
    nodes:
      "Bladeburst, Physical Amplification, Perfect Foresight, Ultimate Slash I–II, Mind's Eye",
    description: "Crit-driven extra hits; Mind's Eye resets Bladeburst.",
    cost: 14,
  },
  {
    title: 'Greatsword swap',
    nodes: 'Vengeful Rush, Final Cleave and the burst nodes',
    description:
      'Emergency damage reduction under 50% HP and a finisher. Uses the rest of the 92.',
    cost: 34,
  },
];

export type TraitPhaseStatus = TraitPhase & {
  /** Running total of costs up to and including this phase. */
  total: number;
  state: 'done' | 'part' | 'todo';
  toGo: number;
};

export function traitPhaseStatuses(points: number): TraitPhaseStatus[] {
  let total = 0;

  return PHASES.map((phase) => {
    const start = total;
    total += phase.cost;

    return {
      ...phase,
      total,
      state: points >= total ? 'done' : points > start ? 'part' : 'todo',
      toGo: total - points,
    };
  });
}
