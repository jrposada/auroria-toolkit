// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import i18n from '../../i18n';
import { THEME_STORAGE_KEY } from './theme';
import ThemeToggle from './theme-toggle';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
});

describe('Given <ThemeToggle/> in a DOM', () => {
  it('when clicked then it cycles system → light → dark → system and sets data-theme on <html>', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeToggle />
      </I18nextProvider>
    );
    const html = document.documentElement;
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
