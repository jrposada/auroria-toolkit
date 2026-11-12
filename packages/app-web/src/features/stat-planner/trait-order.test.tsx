import { describe, expect, it } from 'vitest';

import { planFor } from './test/game-data';
import { renderPart, textOf } from './test/render';
import TraitOrder from './trait-order';

const render = (traitPoints: number) =>
  renderPart(<TraitOrder plan={planFor({ traitPoints })} />, { traitPoints });
const items = (html: string) =>
  [...html.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((match) => textOf(match[1]!));
const states = (html: string) =>
  [...html.matchAll(/<li data-state="([a-z]+)"/g)].map((match) => match[1]);
const count = (list: string[], text: string) =>
  list.filter((item) => item.endsWith(` ${text}`)).length;

describe('Given <TraitOrder/>', () => {
  it('when no points are earned then all eight phases are later', () => {
    const html = render(0);
    const list = items(html);

    expect(states(html)).toEqual(Array(8).fill('todo'));
    expect(html.match(/>Later</g)).toHaveLength(8);
    expect(list[0]).toBe(
      '1 Parry → Sharpwake Parry, Counterattack, Longsword Proficiency, Swift Flurry, Sharpwake Parries grant Sharpwake: crit and damage up for 20 s, 3 stacks. Your main crit source. ~5 pts total 5 Later'
    );
    expect(list[7]).toContain('~34 pts total 92');
  });

  it('when 7 points are earned then the first is done, the second has 2 to go and the rest are later', () => {
    const html = render(7);
    const list = items(html);

    expect(states(html)).toEqual([
      'done',
      'part',
      'todo',
      'todo',
      'todo',
      'todo',
      'todo',
      'todo',
    ]);
    expect(count(list, 'Done')).toBe(1);
    expect(count(list, '2 to go')).toBe(1);
    expect(count(list, 'Later')).toBe(6);
  });

  it('when 92 points are earned then every phase is done', () => {
    expect(count(items(render(92)), 'Done')).toBe(8);
  });

  it('then the trait points input runs 0 to 100 with its hint and the intro', () => {
    const html = render(0);
    const text = textOf(html);

    expect(html).toMatch(/<input[^>]*type="number"[^>]*min="0"[^>]*max="100"/);
    expect(text).toContain('Trait points earned');
    expect(text).toContain('Early Access regions hold 92');
    expect(text).toContain(
      "Trait points come from Raeven's Coilstones (boss-guarded), not levels."
    );
  });
});
