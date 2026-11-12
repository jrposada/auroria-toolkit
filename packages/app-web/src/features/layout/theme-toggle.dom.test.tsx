// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import i18n from '../../i18n';
import { THEME_STORAGE_KEY } from './theme';
import ThemeToggle from './theme-toggle';

const NARROW = '(max-width: 639.98px)';

function renderToggle() {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeToggle />
    </I18nextProvider>
  );
}

const html = document.documentElement;

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  html.removeAttribute('data-theme');
});

describe('Given <ThemeToggle/> on a wide screen', () => {
  it('when Dark is chosen then data-theme is dark and the choice is stored', () => {
    renderToggle();

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(html.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"dark"');
    expect(screen.getByRole('radio', { checked: true })).toBe(
      screen.getByRole('radio', { name: 'Dark' })
    );
  });

  it('when System is chosen after Dark then data-theme is removed', () => {
    renderToggle();

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    fireEvent.click(screen.getByRole('radio', { name: 'System' }));

    expect(html.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"system"');
  });

  it('with "light" stored then Light is checked and data-theme is light', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '"light"');

    renderToggle();

    expect(screen.getByRole('radio', { checked: true })).toBe(
      screen.getByRole('radio', { name: 'Light' })
    );
    expect(html.getAttribute('data-theme')).toBe('light');
  });

  it('with "purple" stored then System is checked and data-theme is absent', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '"purple"');

    renderToggle();

    expect(screen.getByRole('radio', { checked: true })).toBe(
      screen.getByRole('radio', { name: 'System' })
    );
    expect(html.hasAttribute('data-theme')).toBe(false);
  });
});

describe('Given <ThemeToggle/> under 640px', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === NARROW,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
  });

  it('then it is one button and no radio group', () => {
    renderToggle();

    expect(screen.getByRole('button')).toBeDefined();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('when clicked then it cycles system → light → dark → system and sets data-theme on <html>', () => {
    renderToggle();
    const toggle = () => screen.getByRole('button');

    expect(html.hasAttribute('data-theme')).toBe(false);
    expect(toggle().getAttribute('aria-label')).toBe(
      'Theme: System. Switch to Light.'
    );

    fireEvent.click(toggle());
    expect(html.getAttribute('data-theme')).toBe('light');
    expect(toggle().getAttribute('aria-label')).toBe(
      'Theme: Light. Switch to Dark.'
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('"light"');

    fireEvent.click(toggle());
    expect(html.getAttribute('data-theme')).toBe('dark');
    expect(toggle().getAttribute('aria-label')).toBe(
      'Theme: Dark. Switch to System.'
    );

    fireEvent.click(toggle());
    expect(html.hasAttribute('data-theme')).toBe(false);
    expect(toggle().getAttribute('aria-label')).toBe(
      'Theme: System. Switch to Light.'
    );
  });
});

describe('Given <ThemeToggle/> resized across 640px', () => {
  it('when Dark was chosen wide then the narrow button says Dark', () => {
    let narrow = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === NARROW && narrow,
      media: query,
      addEventListener: (_: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        listeners.delete(listener),
    }));
    renderToggle();

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    narrow = true;
    act(() => listeners.forEach((listener) => listener()));

    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe(
      'Theme: Dark. Switch to System.'
    );
    expect(html.getAttribute('data-theme')).toBe('dark');
  });
});
