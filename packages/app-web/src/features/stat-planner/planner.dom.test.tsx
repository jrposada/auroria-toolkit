// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULTS, PLANNER_STORAGE_KEY } from './planner-form';
import { pageText, renderPlanner, shownLevel, slider, tile } from './test/dom';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function stored(): Record<string, unknown> {
  return JSON.parse(localStorage.getItem(PLANNER_STORAGE_KEY)!);
}

function field(label: string | RegExp): HTMLInputElement {
  return screen.getByLabelText<HTMLInputElement>(label);
}

function testDamage(): HTMLInputElement {
  return screen.getAllByLabelText<HTMLInputElement>(
    'Test: total damage dealt'
  )[0]!;
}

describe('Given <Planner/> in a DOM', () => {
  it('when game data is loaded then it renders from the mocked data', () => {
    renderPlanner();

    expect(pageText()).toContain('Talent at level 40 23');
    expect(pageText()).toContain('Stats at level 1');
    expect(pageText()).toContain("Set by Wrathful Tyrant's Horn");
    expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
    expect(screen.getAllByRole('radio')).toHaveLength(15);
    expect(pageText()).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('when Lv 40 is clicked and Twisted Fate Blade is selected then the Talent target is 30 and totals are 88 / 56 / 30', () => {
    renderPlanner();

    fireEvent.click(screen.getByRole('button', { name: 'Lv 40' }));
    fireEvent.click(tile('twisted-fate-blade'));

    expect(tile('twisted-fate-blade').getAttribute('aria-checked')).toBe(
      'true'
    );
    const text = pageText();
    expect(text).toContain('Talent at level 40 30');
    expect(text).toContain('Set by Twisted Fate Blade');
    expect(text).toContain('Reached at level 38');
    expect(text).toContain('Strength 29 59 88');
    expect(text).toContain('Constitution 17 39 56');
    expect(text).toContain('Talent 11 19 30');
  });

  it('when a test input is typed in then the example-numbers badge is hidden', () => {
    renderPlanner();
    expect(pageText()).toContain('Example numbers');

    fireEvent.change(screen.getAllByLabelText('Test: total damage dealt')[0]!, {
      target: { value: '1300' },
    });

    expect(pageText()).not.toContain('Example numbers');
  });

  it('when trait points are changed then phases read Done, n to go and Later', () => {
    renderPlanner();

    fireEvent.change(screen.getByLabelText(/^Trait points earned/), {
      target: { value: '7' },
    });

    const text = pageText();
    expect(text).toContain('total 5 Done');
    expect(text).toContain('total 9 2 to go');
    expect(text).toContain('total 12 Later');
  });

  it('when Reset to defaults is clicked then every setting returns to its default', () => {
    renderPlanner();
    fireEvent.change(slider(), { target: { value: '27' } });
    fireEvent.change(field('Strength : Constitution per level'), {
      target: { value: '3' },
    });
    fireEvent.change(field('Start adding Talent at level'), {
      target: { value: '31' },
    });
    fireEvent.click(tile('twisted-fate-blade'));
    fireEvent.click(tile('fallen-margrave'));
    fireEvent.change(testDamage(), { target: { value: '1300' } });
    fireEvent.change(field(/^Trait points earned/), {
      target: { value: '7' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    expect(shownLevel()).toBe(1);
    expect(slider().value).toBe('1');
    expect(field('Strength : Constitution per level').value).toBe('2');
    expect(field('Start adding Talent at level').value).toBe('29');
    expect(tile('wrathful-tyrants-horn').getAttribute('aria-checked')).toBe(
      'true'
    );
    expect(tile('scattered-mist').getAttribute('aria-checked')).toBe('true');
    expect(testDamage().value).toBe('1200');
    expect(field(/^Trait points earned/).value).toBe('0');
    expect(pageText()).toContain('Example numbers');
    expect(stored()).toEqual(DEFAULTS);
  });

  describe('persistence', () => {
    it('when a setting changes then it is written to auroria-stat-planner-v1', () => {
      renderPlanner();

      fireEvent.click(tile('twisted-fate-blade'));
      expect(stored().lsId).toBe('twisted-fate-blade');

      fireEvent.change(slider(), { target: { value: '12' } });
      expect(stored().level).toBe(12);
    });

    it('when the page is rendered again then the stored settings come back', () => {
      renderPlanner();
      fireEvent.change(slider(), { target: { value: '27' } });
      fireEvent.change(testDamage(), { target: { value: '1300' } });
      cleanup();

      renderPlanner();

      expect(shownLevel()).toBe(27);
      expect(testDamage().value).toBe('1300');
      expect(pageText()).not.toContain('Example numbers');
    });

    it('a cleared input reloads as its default', () => {
      renderPlanner();
      fireEvent.change(field(/^Trait points earned/), {
        target: { value: '' },
      });
      expect(stored().traitPoints).toBeNull();
      cleanup();

      renderPlanner();

      expect(field(/^Trait points earned/).value).toBe('0');
      expect(pageText()).not.toContain('NaN');
    });

    it('when storage holds junk then the defaults are used', () => {
      localStorage.setItem(PLANNER_STORAGE_KEY, '{not json');
      renderPlanner();

      expect(shownLevel()).toBe(1);
      expect(tile('wrathful-tyrants-horn').getAttribute('aria-checked')).toBe(
        'true'
      );
      cleanup();

      localStorage.setItem(
        PLANNER_STORAGE_KEY,
        JSON.stringify({ level: 'x', ratio: '9', traitPoints: 3 })
      );
      renderPlanner();

      expect(shownLevel()).toBe(1);
      expect(field('Strength : Constitution per level').value).toBe('2');
      expect(field(/^Trait points earned/).value).toBe('3');
    });

    it('when localStorage throws then the planner still renders and responds', () => {
      const denied = () => {
        throw new Error('denied');
      };
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);

      expect(() => renderPlanner()).not.toThrow();
      expect(shownLevel()).toBe(1);

      fireEvent.click(screen.getByRole('button', { name: 'Level up' }));
      expect(shownLevel()).toBe(2);
    });
  });
});
