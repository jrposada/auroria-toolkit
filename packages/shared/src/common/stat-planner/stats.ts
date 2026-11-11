export const STAT_KEYS = ['str', 'agi', 'con', 'int', 'tal', 'end'] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export type StatBlock = Record<StatKey, number>;
