// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Segmented from './segmented';

const OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

afterEach(cleanup);

describe('Given <Segmented/> in a DOM', () => {
  it('when an option is clicked then it reports that value', () => {
    const onChange = vi.fn();
    render(
      <Segmented
        label="Theme"
        options={OPTIONS}
        value="system"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('when the value changes then the checked radio follows', () => {
    const { rerender } = render(
      <Segmented
        label="Theme"
        options={OPTIONS}
        value="system"
        onChange={() => {}}
      />
    );

    rerender(
      <Segmented
        label="Theme"
        options={OPTIONS}
        value="dark"
        onChange={() => {}}
      />
    );

    expect(screen.getByRole('radio', { checked: true })).toBe(
      screen.getByRole('radio', { name: 'Dark' })
    );
  });
});
