import { QueryClientProvider } from '@tanstack/react-query';
import { render, RenderResult, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import i18n from '../../../i18n';
import Planner from '../planner';
import { PlannerForm } from '../planner-form';
import { seededQueryClient } from './game-data';
import { textOf } from './render';

export function renderPlanner(initialForm?: PlannerForm): RenderResult {
  return render(
    <QueryClientProvider client={seededQueryClient()}>
      <I18nextProvider i18n={i18n}>
        <Planner initialForm={initialForm} />
      </I18nextProvider>
    </QueryClientProvider>
  );
}

/** The visible text of the whole page, the portalled tooltip included. */
export function pageText(): string {
  return textOf(document.body.innerHTML);
}

export function shownLevel(): number {
  const match = /Stats at level (\d+)/.exec(pageText());
  if (!match) {
    throw new Error('No "Stats at level" heading on the page');
  }

  return Number(match[1]);
}

export function tile(id: string): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(
    `[data-weapon="${id}"]`
  );
  if (!element) {
    throw new Error(`No tile for ${id}`);
  }

  return element;
}

export function slider(): HTMLInputElement {
  return screen.getByRole<HTMLInputElement>('slider', {
    name: 'Character level',
  });
}
