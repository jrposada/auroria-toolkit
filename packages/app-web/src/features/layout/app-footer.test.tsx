import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import i18n from '../../i18n';
import AppFooter from './app-footer';

describe('Given <AppFooter/>', () => {
  const html = renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <AppFooter />
    </I18nextProvider>
  );

  it.each([
    ['RaidDex', 'https://raiddex.com/en/archeage-chronicles/builds'],
    ['Wikily', 'https://wikily.gg/archeage-chronicles/weapons/longsword'],
    ['ArcheAgeBuilds', 'https://archeagebuilds.com/classes/warrior/'],
  ])('then it links %s', (name, url) => {
    expect(html).toContain(`<a href="${url}" rel="noreferrer">${name}</a>`);
  });

  it('then it names MetaForge without a link', () => {
    expect(html).toContain('MetaForge');
    expect(html).not.toMatch(/<a[^>]*>MetaForge/);
  });

  it('then it carries the full disclaimer', () => {
    expect(html).toContain(
      'Auroria Toolkit is an unofficial fan project. It is not affiliated with, endorsed by or sponsored by XLGAMES. ArcheAge Chronicles and its assets belong to XLGAMES.'
    );
  });

  it('then it joins nothing with middle dots', () => {
    expect(html).not.toContain('·');
  });
});
