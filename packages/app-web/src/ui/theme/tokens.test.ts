import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../..', import.meta.url));

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]
  );

const sources = files(SRC).filter((file) => !/\.test\.tsx?$/.test(file));
const read = (file: string) => readFileSync(file, 'utf8');
const cssFiles = sources.filter((file) => file.endsWith('.css'));
const tsxFiles = sources.filter((file) => file.endsWith('.tsx'));

const tokens = read(join(SRC, 'ui/theme/tokens.css'));
const MEDIA_DARK =
  "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light']) {";
const THEME_DARK = ":root[data-theme='dark'] {";

const blockAfter = (opener: string): string => {
  const start = tokens.indexOf(opener);
  if (start < 0) {
    throw new Error(`No block opened by ${opener}`);
  }
  const body = tokens.slice(start + opener.length);

  return body.slice(0, body.indexOf('}'));
};

const root = blockAfter(':root {');
const mediaDark = blockAfter(MEDIA_DARK);
const themeDark = blockAfter(THEME_DARK);

const declared = (block: string, name: string): string | undefined =>
  new RegExp(`(?:^|\\s)--${name}:\\s*([^;]+);`).exec(block)?.[1]?.trim();

const LIGHT = {
  paper: '#EDF0EA',
  sheet: '#F8F9F5',
  ink: '#1C2A33',
  'ink-soft': '#55656B',
  rule: '#C9D2CE',
  sea: '#2F6A88',
  luna: '#5B43C9',
  warn: '#A3262A',
};

const DARK = {
  paper: '#10202A',
  sheet: '#162A35',
  ink: '#E3EAE6',
  'ink-soft': '#93A6AB',
  rule: '#2A4350',
  sea: '#6FB7D6',
  luna: '#AC9BFF',
  warn: '#F08A80',
};

describe('Given the theme tokens', () => {
  it.each(Object.entries(LIGHT))('then --%s is %s in light', (name, hex) => {
    expect(declared(root, name)?.toUpperCase()).toBe(hex);
  });

  it.each(Object.entries(DARK))(
    'then --%s is %s under the dark media query and data-theme="dark"',
    (name, hex) => {
      expect(declared(mediaDark, name)?.toUpperCase()).toBe(hex);
      expect(declared(themeDark, name)?.toUpperCase()).toBe(hex);
    }
  );

  it.each([
    [1, 8],
    [2, 16],
    [3, 26],
    [4, 38],
  ])('then --depth-%i mixes %i%% sea into paper', (n, pct) => {
    expect(declared(root, `depth-${n}`)).toBe(
      `color-mix(in oklab, var(--sea) ${pct}%, var(--paper))`
    );
  });

  it.each([
    ['common', '#8a8f8c'],
    ['uncommon', '#3f9a4f'],
    ['rare', '#3a73c9'],
    ['epic', '#8a4fc4'],
    ['legendary', '#d0802a'],
  ])('then the %s rarity colour is unchanged', (rarity, hex) => {
    expect(declared(root, `r-${rarity}`)).toBe(hex);
  });

  it('then the item card skin is the dark palette in both themes', () => {
    expect(declared(root, 'tip-bg')?.toUpperCase()).toBe('#162A35');
    expect(declared(root, 'tip-ink')?.toUpperCase()).toBe('#E3EAE6');
    expect(declared(root, 'tip-muted')?.toUpperCase()).toBe('#93A6AB');
    expect(declared(root, 'tip-line')?.toUpperCase()).toBe('#2A4350');
    expect(declared(mediaDark, 'tip-bg')).toBeUndefined();
    expect(declared(themeDark, 'tip-bg')).toBeUndefined();
  });

  it('then floating layers have a lift in both themes and an open duration', () => {
    expect(declared(root, 'lift')).toBeDefined();
    expect(declared(mediaDark, 'lift')).toBeDefined();
    expect(declared(themeDark, 'lift')).toBeDefined();
    expect(declared(root, 'fade')).toBe('120ms');
  });

  it('then every var(--x) used in src is declared somewhere', () => {
    const names = new Set<string>();
    for (const file of cssFiles) {
      for (const match of read(file).matchAll(/(--[a-z0-9-]+)\s*:/g)) {
        names.add(match[1]!);
      }
    }
    for (const file of tsxFiles) {
      for (const match of read(file).matchAll(/'(--[a-z0-9-]+)'/g)) {
        names.add(match[1]!);
      }
    }

    // .ts files are skipped: their only uses are the --r-${…} rarity template
    // and a doc comment.
    const undeclared = [...cssFiles, ...tsxFiles].flatMap((file) =>
      [...read(file).matchAll(/var\((--[a-z0-9-]*[a-z0-9])\b(?!-)/g)]
        .map((match) => match[1]!)
        .filter((name) => !names.has(name))
        .map((name) => `${file.slice(SRC.length)}: ${name}`)
    );

    expect(undeclared).toEqual([]);
  });

  it('then no stylesheet uses a monospace face or all-caps', () => {
    const css = cssFiles.map(read).join('\n');

    expect(css).not.toMatch(
      /monospace|--font-mono|text-transform:\s*uppercase/
    );
  });
});
