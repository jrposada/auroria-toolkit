import { describe, expect, it } from 'vitest';

import LevelBar from './level-bar';
import { renderPart, textOf } from './test/render';

describe('Given <LevelBar/>', () => {
  it('then it renders the stored level, the slider range and both steppers', () => {
    const html = renderPart(<LevelBar maxLevel={40} />, { level: 27 });

    expect(html).toMatch(/<input[^>]*type="range"[^>]*>/);
    expect(html).toMatch(/min="1"/);
    expect(html).toMatch(/max="40"/);
    expect(html).toContain('aria-label="Character level"');
    expect(html).toContain('aria-label="Level down"');
    expect(html).toContain('aria-label="Level up"');
    expect(textOf(html)).toMatch(/^27 Level/);
  });

  it('then it offers the five shortcuts and marks the current one', () => {
    const html = renderPart(<LevelBar maxLevel={40} />, { level: 30 });

    for (const level of [1, 10, 20, 30, 40]) {
      expect(html).toContain(`>Lv ${level}<`);
    }
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Lv 30</);
  });

  it('when at level 1 then − is disabled and + is not', () => {
    const html = renderPart(<LevelBar maxLevel={40} />, { level: 1 });

    expect(html.match(/disabled=""/g)).toHaveLength(1);
    expect(html).toMatch(/<button disabled=""[^>]*aria-label="Level down"/);
  });

  it('when at the max level then + is disabled and − is not', () => {
    const html = renderPart(<LevelBar maxLevel={40} />, { level: 40 });

    expect(html.match(/disabled=""/g)).toHaveLength(1);
    expect(html).toMatch(/<button disabled=""[^>]*aria-label="Level up"/);
  });

  it('when the class is shorter then it clamps the level and drops shortcuts above it', () => {
    const html = renderPart(<LevelBar maxLevel={10} />, { level: 40 });

    expect(textOf(html)).toMatch(/^10 Level/);
    expect(html).not.toContain('>Lv 20<');
  });
});
