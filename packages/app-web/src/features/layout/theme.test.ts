import { describe, expect, it, vi } from 'vitest';

import { applyThemeChoice, nextThemeChoice, parseThemeChoice } from './theme';

describe('nextThemeChoice', () => {
  it.each([
    ['system', 'light'],
    ['light', 'dark'],
    ['dark', 'system'],
  ] as const)('after %s comes %s', (current, next) => {
    expect(nextThemeChoice(current)).toBe(next);
  });
});

describe('parseThemeChoice', () => {
  it.each(['purple', '', null, undefined, 3, { a: 1 }])(
    'falls back to system for %j',
    (value) => {
      expect(parseThemeChoice(value)).toBe('system');
    }
  );

  it.each(['system', 'light', 'dark'])('keeps %s', (value) => {
    expect(parseThemeChoice(value)).toBe(value);
  });
});

describe('applyThemeChoice', () => {
  it('sets data-theme for an explicit choice', () => {
    const root = { setAttribute: vi.fn(), removeAttribute: vi.fn() };

    applyThemeChoice(root, 'dark');

    expect(root.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('removes data-theme for system', () => {
    const root = { setAttribute: vi.fn(), removeAttribute: vi.fn() };

    applyThemeChoice(root, 'system');

    expect(root.removeAttribute).toHaveBeenCalledWith('data-theme');
    expect(root.setAttribute).not.toHaveBeenCalled();
  });
});
