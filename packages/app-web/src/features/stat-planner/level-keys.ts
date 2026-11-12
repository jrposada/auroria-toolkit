export type LevelKeyInput = {
  key: string;
  targetTag: string | null;
  /** Arrow keys there move focus between tiles instead. */
  inTileGroup: boolean;
  /** Ctrl, Meta or Alt held: the browser owns the key (Alt+← is back). */
  modifier: boolean;
};

const FIELD_TAGS = ['INPUT', 'SELECT', 'TEXTAREA'];

export function levelKeyDelta({
  key,
  targetTag,
  inTileGroup,
  modifier,
}: LevelKeyInput): -1 | 0 | 1 {
  if (modifier || FIELD_TAGS.includes(targetTag?.toUpperCase() ?? '')) {
    return 0;
  }

  const arrow = key === 'ArrowLeft' || key === 'ArrowRight';
  if (arrow && inTileGroup) {
    return 0;
  }

  if (key === 'ArrowRight' || key === '+') {
    return 1;
  }

  return key === 'ArrowLeft' || key === '-' ? -1 : 0;
}
