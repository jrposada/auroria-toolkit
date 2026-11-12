// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PLANNER_STORAGE_KEY } from './planner-form';
import { renderPlanner, shownLevel, slider, tile } from './test/dom';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function button(name: string): HTMLButtonElement {
  return screen.getByRole<HTMLButtonElement>('button', { name });
}

/** The form value itself, which the page only shows after clamping. */
function storedLevel(): unknown {
  return JSON.parse(localStorage.getItem(PLANNER_STORAGE_KEY)!).level;
}

function press(key: string, target: Element = document.body, init = {}) {
  fireEvent.keyDown(target, { key, ...init });
}

describe('Given the level bar in a DOM', () => {
  beforeEach(() => {
    renderPlanner();
  });

  it('when the slider changes then the level follows', () => {
    fireEvent.change(slider(), { target: { value: '27' } });

    expect(shownLevel()).toBe(27);
  });

  it('when − and + are clicked then the level steps and they disable at 1 and 40', () => {
    expect(button('Level down').disabled).toBe(true);

    fireEvent.click(button('Level up'));
    expect(shownLevel()).toBe(2);
    expect(button('Level down').disabled).toBe(false);

    fireEvent.click(button('Lv 40'));
    expect(shownLevel()).toBe(40);
    expect(button('Level up').disabled).toBe(true);

    fireEvent.click(button('Level down'));
    expect(shownLevel()).toBe(39);
  });

  it('when a Lv shortcut is clicked then the level jumps and that shortcut is pressed', () => {
    fireEvent.click(button('Lv 30'));

    expect(shownLevel()).toBe(30);
    expect(slider().value).toBe('30');
    expect(button('Lv 30').getAttribute('aria-pressed')).toBe('true');
    expect(button('Lv 1').getAttribute('aria-pressed')).toBe('false');
  });

  it('when ←, →, − and + are pressed on the page then the level changes', () => {
    press('ArrowRight');
    expect(shownLevel()).toBe(2);
    press('+');
    expect(shownLevel()).toBe(3);
    press('-');
    expect(shownLevel()).toBe(2);
    press('ArrowLeft');
    expect(shownLevel()).toBe(1);
  });

  it('keys clamp at both ends', () => {
    press('ArrowLeft');
    expect(shownLevel()).toBe(1);
    expect(storedLevel()).toBe(1);

    fireEvent.click(button('Lv 40'));
    press('+');
    expect(shownLevel()).toBe(40);
    expect(storedLevel()).toBe(40);
  });

  it('when the key comes from an input or select then the level stays', () => {
    press('ArrowRight', screen.getByLabelText(/^Trait points earned/));
    press('+', screen.getByLabelText('Strength : Constitution per level'));

    expect(shownLevel()).toBe(1);
  });

  it('when Ctrl, Meta or Alt is held then the level stays', () => {
    press('ArrowRight', document.body, { ctrlKey: true });
    press('ArrowRight', document.body, { metaKey: true });
    press('ArrowRight', document.body, { altKey: true });

    expect(shownLevel()).toBe(1);
  });

  it('when an arrow comes from a weapon tile then the level stays, but + still works', () => {
    press('ArrowRight', tile('wrathful-tyrants-horn'));
    expect(shownLevel()).toBe(1);

    press('+', tile('wrathful-tyrants-horn'));
    expect(shownLevel()).toBe(2);
  });
});
