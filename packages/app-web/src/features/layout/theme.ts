export const THEME_STORAGE_KEY = 'auroria-theme';

export const THEME_CHOICES = ['system', 'light', 'dark'] as const;

export type ThemeChoice = (typeof THEME_CHOICES)[number];

export function parseThemeChoice(value: unknown): ThemeChoice {
  return THEME_CHOICES.find((choice) => choice === value) ?? 'system';
}

export function nextThemeChoice(choice: ThemeChoice): ThemeChoice {
  const index = THEME_CHOICES.indexOf(choice);

  return THEME_CHOICES[(index + 1) % THEME_CHOICES.length]!;
}

export function applyThemeChoice(
  root: Pick<HTMLElement, 'setAttribute' | 'removeAttribute'>,
  choice: ThemeChoice
): void {
  if (choice === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', choice);
  }
}
