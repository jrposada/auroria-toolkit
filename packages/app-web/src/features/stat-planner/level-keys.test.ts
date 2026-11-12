import { describe, expect, it } from 'vitest';

import { levelKeyDelta, LevelKeyInput } from './level-keys';

const delta = (input: Partial<LevelKeyInput>) =>
  levelKeyDelta({
    key: 'ArrowRight',
    targetTag: 'BODY',
    inTileGroup: false,
    modifier: false,
    ...input,
  });

describe('Given the level keyboard shortcuts', () => {
  it.each([
    ['ArrowRight', 1],
    ['+', 1],
    ['ArrowLeft', -1],
    ['-', -1],
    ['a', 0],
    ['ArrowUp', 0],
    ['Enter', 0],
  ])('when pressing %s then the level changes by %s', (key, change) => {
    expect(delta({ key })).toBe(change);
  });

  it.each(['INPUT', 'input', 'SELECT', 'TEXTAREA'])(
    'when focus is in %s then the key is ignored',
    (targetTag) => {
      expect(delta({ targetTag })).toBe(0);
    }
  );

  it('when focus is on a button or nowhere then the key still counts', () => {
    expect(delta({ targetTag: 'BUTTON' })).toBe(1);
    expect(delta({ targetTag: null })).toBe(1);
  });

  it('when focus is in a tile group then arrows are ignored but + and − are not', () => {
    expect(delta({ inTileGroup: true })).toBe(0);
    expect(delta({ key: 'ArrowLeft', inTileGroup: true })).toBe(0);
    expect(delta({ key: '+', inTileGroup: true })).toBe(1);
    expect(delta({ key: '-', inTileGroup: true })).toBe(-1);
  });

  it('when a modifier is held then the key is ignored', () => {
    expect(delta({ key: 'ArrowLeft', modifier: true })).toBe(0);
  });
});
