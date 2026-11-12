import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from './app';

describe('Given <App/>', () => {
  it('then it renders', () => {
    expect(renderToStaticMarkup(<App />)).toContain('Auroria Toolkit');
  });
});
