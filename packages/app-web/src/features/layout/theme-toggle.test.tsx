import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import i18n from '../../i18n';
import ThemeToggle from './theme-toggle';

describe('Given <ThemeToggle/> with nothing stored', () => {
  const html = renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <ThemeToggle />
    </I18nextProvider>
  );

  it('then it is a radio group named Theme with System, Light and Dark', () => {
    expect(html).toMatch(/role="radiogroup"[^>]*aria-label="Theme"/);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html).toContain('>System<');
    expect(html).toContain('>Light<');
    expect(html).toContain('>Dark<');
  });

  it('then System is checked', () => {
    const checked = html.match(/<input[^>]*checked[^>]*>/g);

    expect(checked).toHaveLength(1);
    expect(checked?.[0]).toContain('value="system"');
  });

  it('then there is no cycling button', () => {
    expect(html).not.toContain('<button');
  });
});
