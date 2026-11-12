import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import StepperButton from './stepper-button';

describe('Given <StepperButton/>', () => {
  it('then it is a labelled button showing its symbol', () => {
    const html = renderToStaticMarkup(
      <StepperButton label="Level down">−</StepperButton>
    );

    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Level down"');
    expect(html).toContain('−');
  });

  it('when disabled then the button is disabled', () => {
    const html = renderToStaticMarkup(
      <StepperButton label="Level up" disabled>
        +
      </StepperButton>
    );

    expect(html).toContain('disabled=""');
  });
});
