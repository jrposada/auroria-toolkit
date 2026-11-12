// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pageText, renderPlanner, shownLevel, slider, tile } from './test/dom';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function group(name: 'Longsword' | 'Greatsword'): HTMLElement {
  return screen.getByRole('radiogroup', { name });
}

function tiles(name: 'Longsword' | 'Greatsword'): HTMLButtonElement[] {
  return within(group(name)).getAllByRole<HTMLButtonElement>('radio');
}

function tooltip(): HTMLElement | null {
  return screen.queryByRole('tooltip');
}

describe('Given the weapon tiles in a DOM', () => {
  beforeEach(() => {
    renderPlanner();
  });

  it('then each group has one tab stop, on the checked tile', () => {
    for (const [name, id] of [
      ['Longsword', 'wrathful-tyrants-horn'],
      ['Greatsword', 'scattered-mist'],
    ] as const) {
      const stops = tiles(name).filter((element) => element.tabIndex === 0);

      expect(stops).toHaveLength(1);
      expect(stops[0]!.dataset.weapon).toBe(id);
      expect(stops[0]!.getAttribute('aria-checked')).toBe('true');
    }
  });

  it('when arrows are pressed on a tile then focus moves without changing the selection', () => {
    const all = tiles('Longsword');
    const checked = all.findIndex(
      (element) => element.getAttribute('aria-checked') === 'true'
    );
    const next = all[(checked + 1) % all.length]!;
    act(() => all[checked]!.focus());

    fireEvent.keyDown(all[checked]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(next);
    expect(next.tabIndex).toBe(0);
    expect(all[checked]!.tabIndex).toBe(-1);

    fireEvent.keyDown(next, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(all[checked]);

    fireEvent.keyDown(all[checked]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(next);
    fireEvent.keyDown(next, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(all[checked]);

    expect(
      all.map((element) => element.getAttribute('aria-checked') === 'true')
    ).toEqual(all.map((_, index) => index === checked));
    expect(shownLevel()).toBe(1);
  });

  it('leaving the group returns the tab stop to the checked tile', () => {
    const checked = tile('wrathful-tyrants-horn');
    act(() => checked.focus());
    fireEvent.keyDown(checked, { key: 'ArrowRight' });
    expect(checked.tabIndex).toBe(-1);

    act(() => slider().focus());

    expect(checked.tabIndex).toBe(0);
  });

  it('tiles are native buttons, so Enter and Space click them', () => {
    for (const element of [...tiles('Longsword'), ...tiles('Greatsword')]) {
      expect(element.tagName).toBe('BUTTON');
      expect(element.type).toBe('button');
    }
  });

  it('when a tile is clicked then it is selected and keeps focus', () => {
    fireEvent.click(tile('frozen-anguish'));

    expect(tile('frozen-anguish').getAttribute('aria-checked')).toBe('true');
    expect(tile('wrathful-tyrants-horn').getAttribute('aria-checked')).toBe(
      'false'
    );
    expect(document.activeElement).toBe(tile('frozen-anguish'));
    expect(tile('frozen-anguish').tabIndex).toBe(0);
  });
});

describe('Given the weapon tooltip in a DOM', () => {
  beforeEach(() => {
    renderPlanner();
  });

  it('when a tile is focused then the tooltip opens and describes it', () => {
    act(() => tile('twisted-fate-blade').focus());

    expect(tooltip()?.id).toBe('weapon-tip-ls');
    expect(tooltip()?.textContent).toContain('Twisted Fate Blade');
    expect(tile('twisted-fate-blade').getAttribute('aria-describedby')).toBe(
      'weapon-tip-ls'
    );
  });

  it('when a tile is hovered then the tooltip opens', () => {
    fireEvent.pointerEnter(tile('scattered-mist'));

    expect(tooltip()?.id).toBe('weapon-tip-gs');
    expect(tile('scattered-mist').getAttribute('aria-describedby')).toBe(
      'weapon-tip-gs'
    );
  });

  it('hovering another tile moves the tooltip', () => {
    fireEvent.pointerEnter(tile('frozen-anguish'));
    fireEvent.pointerEnter(tile('twisted-fate-blade'));

    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(tooltip()?.textContent).toContain('Twisted Fate Blade');
    expect(tile('twisted-fate-blade').getAttribute('aria-describedby')).toBe(
      'weapon-tip-ls'
    );
    expect(tile('frozen-anguish').hasAttribute('aria-describedby')).toBe(false);
  });

  it('closes on Escape', () => {
    fireEvent.pointerEnter(tile('frozen-anguish'));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(tooltip()).toBeNull();
    expect(tile('frozen-anguish').hasAttribute('aria-describedby')).toBe(false);
  });

  it('closes on blur', () => {
    act(() => tile('frozen-anguish').focus());

    act(() => tile('frozen-anguish').blur());

    expect(tooltip()).toBeNull();
  });

  it('closes on pointer leave', () => {
    fireEvent.pointerEnter(tile('frozen-anguish'));

    fireEvent.pointerLeave(group('Longsword'));

    expect(tooltip()).toBeNull();
  });

  it('closes on scroll', () => {
    fireEvent.pointerEnter(tile('frozen-anguish'));

    fireEvent.scroll(window);

    expect(tooltip()).toBeNull();
  });
});

describe('Given a touch screen', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
    renderPlanner();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('then the touch hint shows', () => {
    expect(pageText()).toContain(
      'Tap a weapon to carry it and see its full stats.'
    );
  });

  it('when a tile is tapped then it is selected and its inline detail opens; tapping again closes it', () => {
    fireEvent.click(tile('frozen-anguish'));

    const detail = document.getElementById('weapon-detail-ls');
    expect(tile('frozen-anguish').getAttribute('aria-checked')).toBe('true');
    expect(detail?.hasAttribute('data-weapon-detail')).toBe(true);
    expect(detail?.textContent).toContain('Frozen Anguish');
    expect(tile('frozen-anguish').getAttribute('aria-describedby')).toBe(
      'weapon-detail-ls'
    );
    expect(tooltip()).toBeNull();

    fireEvent.click(tile('frozen-anguish'));

    expect(document.getElementById('weapon-detail-ls')).toBeNull();
    expect(tile('frozen-anguish').getAttribute('aria-checked')).toBe('true');
  });

  it('when another tile is tapped then the detail switches to it', () => {
    fireEvent.click(tile('frozen-anguish'));
    fireEvent.click(tile('twisted-fate-blade'));

    const details = document.querySelectorAll('[data-weapon-detail]');
    expect(details).toHaveLength(1);
    expect(details[0]!.textContent).toContain('Twisted Fate Blade');
  });
});
