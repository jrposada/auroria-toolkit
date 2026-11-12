// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { pageText, renderPlanner, tile } from './test/dom';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

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
});
