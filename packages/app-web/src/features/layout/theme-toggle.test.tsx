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

  it('then it is a button showing the system choice', () => {
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).toContain('System');
  });

  it('then its label says what a click does', () => {
    expect(html).toContain('aria-label="Theme: System. Switch to Light."');
  });
});
