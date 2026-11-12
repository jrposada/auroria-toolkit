export function availablePoints(level: number, pointsPerLevel = 3): number {
  return (level - 1) * pointsPerLevel;
}
