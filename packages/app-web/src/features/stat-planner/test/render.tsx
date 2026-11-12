import { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PlannerForm } from '../planner-form';
import FormHarness from './form-harness';

export function renderPart(ui: ReactNode, form?: Partial<PlannerForm>): string {
  return renderToStaticMarkup(<FormHarness form={form}>{ui}</FormHarness>);
}

const ENTITIES: Record<string, string> = {
  '&#x27;': "'",
  '&amp;': '&',
  '&gt;': '>',
  '&lt;': '<',
  '&quot;': '"',
};

/** The visible text of server markup, one space between elements. */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;|&amp;|&gt;|&lt;|&quot;/g, (entity) => ENTITIES[entity]!)
    .replace(/\s+/g, ' ')
    .trim();
}
