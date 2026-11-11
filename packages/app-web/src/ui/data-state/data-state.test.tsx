import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import i18n from '../../i18n';
import DataState from './data-state';
import Placeholder from './placeholder';
import { DataStatus } from './query-status';

const render = (status: DataStatus) =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <DataState
        status={status}
        onRetry={() => {}}
        placeholder={<i>skeleton</i>}
      >
        <b>content</b>
      </DataState>
    </I18nextProvider>
  );

describe('Given <DataState/>', () => {
  it('when loading then it is busy, announces it and shows the placeholder', () => {
    const html = render('loading');

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Loading game data');
    expect(html).toContain('<i>skeleton</i>');
    expect(html).not.toContain('content');
  });

  it('when in error then it explains what to do and offers a retry', () => {
    const html = render('error');

    expect(html).toContain('role="alert"');
    expect(html).toContain(
      'Can&#x27;t load game data. Check that the backend is running, then retry.'
    );
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>Retry<\/button>/);
    expect(html).not.toContain('content');
  });

  it('when ready then it renders only its children', () => {
    expect(render('ready')).toBe('<b>content</b>');
  });
});

describe('Given <Placeholder/>', () => {
  it('then it is a hidden block of the given height', () => {
    const html = renderToStaticMarkup(<Placeholder height={160} />);

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('height:160px');
  });
});
