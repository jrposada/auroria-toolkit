import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import i18n from '../../i18n';
import Planner from './planner';
import { DEFAULTS, PlannerForm } from './planner-form';
import { seededQueryClient } from './test/game-data';
import { textOf } from './test/render';

function render(
  initialForm?: PlannerForm,
  queryClient: QueryClient = seededQueryClient()
): string {
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <Planner initialForm={initialForm} />
      </I18nextProvider>
    </QueryClientProvider>
  );
}

describe('Given <Planner/>', () => {
  it('when game data is loaded then the whole planner renders from it', () => {
    const html = render();
    const text = textOf(html);

    expect(html).toContain('aria-label="Character level"');
    expect(html.match(/role="radiogroup"/g)).toHaveLength(2);
    expect(html.match(/role="radio"/g)).toHaveLength(15);
    for (const sentence of [
      'Talent at level 40 23',
      "Set by Wrathful Tyrant's Horn",
      'Reached at level 34',
      'Stats at level 1',
      '0 / 0 points spent',
      'Level 1 → 2',
      'Stat totals, level 1 to 40',
      'Longsword vs Greatsword damage at level 1',
      'Plan settings',
      'Longsword trait order',
      'Checks to run in game',
      "Plans from the Warrior's level-1 base stats",
      '3 stat points per level',
      'Hover or focus a weapon for its full stats; click to carry it.',
    ]) {
      expect(text).toContain(sentence);
    }
    expect(html).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('when Twisted Fate Blade is selected then the Talent target is 30', () => {
    const html = render({
      ...DEFAULTS,
      lsId: 'twisted-fate-blade',
      level: 40,
    });
    const text = textOf(html);

    expect(text).toContain('Talent at level 40 30');
    expect(text).toContain('Set by Twisted Fate Blade');
    expect(text).toContain('Reached at level 38');
    expect(text).toContain('Strength 29 59 88');
    expect(text).toContain('Talent 11 19 30');
    expect(html).toMatch(
      /aria-checked="true"[^>]*data-weapon="twisted-fate-blade"|data-weapon="twisted-fate-blade"[^>]*aria-checked="true"/
    );
  });

  it('when a test input was edited then the example badge is hidden', () => {
    expect(textOf(render(DEFAULTS))).toContain('Example numbers');
    expect(
      textOf(render({ ...DEFAULTS, lsDmg: 1300, testInputsEdited: true }))
    ).not.toContain('Example numbers');
  });

  it('when trait points are entered then phases are marked done, in progress and later', () => {
    const text = textOf(render({ ...DEFAULTS, traitPoints: 7 }));

    expect(text).toContain('total 5 Done');
    expect(text).toContain('total 9 2 to go');
    expect(text).toContain('total 12 Later');
  });

  it('when at level 40 and level 30 then the stats match the reference plan', () => {
    const at40 = textOf(render({ ...DEFAULTS, level: 40 }));
    expect(at40).toContain('Strength 29 66 95');
    expect(at40).toContain('Constitution 17 39 56');
    expect(at40).toContain('Talent 11 12 23');
    expect(at40).toContain('117 / 117 points spent');

    const at30 = textOf(render({ ...DEFAULTS, level: 30 }));
    expect(at30).toContain('Strength 29 54 83');
    expect(at30).toContain('Constitution 17 29 46');
    expect(at30).toContain('Talent 11 4 15');
  });

  it('when game data is loading then the level bar is there and the panels are placeholders', () => {
    const html = render(undefined, new QueryClient());

    expect(html).toContain('aria-label="Character level"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('Stats at level');
  });

  it('when a game data request failed then the level bar stays and the retry message replaces the panels', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, retryOnMount: false } },
    });
    await queryClient.prefetchQuery({
      queryKey: ['classes', { id: 'warrior' }],
      queryFn: () => Promise.reject(new Error('down')),
    });

    const html = render(undefined, queryClient);

    expect(html).toContain('aria-label="Character level"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('>Retry<');
    expect(html).not.toContain('Stats at level');
  });

  it('when there are no weapons then it still renders, with empty groups and base Talent', () => {
    const html = render(undefined, seededQueryClient([]));

    expect(textOf(html)).toContain('Base Talent (11) covers both weapons');
    expect(html).not.toContain('role="radio"');
    expect(html.match(/role="radiogroup"/g)).toHaveLength(2);
  });
});
