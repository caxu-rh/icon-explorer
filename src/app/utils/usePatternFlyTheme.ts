import * as React from 'react';

/**
 * PatternFly v6 dark theme: add `pf-v6-theme-dark` on `<html>`.
 * @see https://www.patternfly.org/foundations-and-styles/theming/dark-theme-handbook
 */
export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'icon-view-theme-preference';
const DARK_CLASS = 'pf-v6-theme-dark';

function readStored(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') {
      return v;
    }
  } catch {
    /* ignore */
  }
  return 'system';
}

/** Whether the active PatternFly theme is dark (respects `system` + `prefers-color-scheme`). */
export function isPatternFlyThemeDark(preference: ThemePreference): boolean {
  if (preference === 'dark') {
    return true;
  }
  if (preference === 'light') {
    return false;
  }
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyPatternFlyTheme(preference: ThemePreference): void {
  const html = document.documentElement;
  if (isPatternFlyThemeDark(preference)) {
    html.classList.add(DARK_CLASS);
  } else {
    html.classList.remove(DARK_CLASS);
  }
}

export function usePatternFlyTheme(): {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  /** Effective dark/light for the current preference (updates for `system` when OS theme changes). */
  isThemeDark: boolean;
} {
  const [preference, setPreferenceState] = React.useState<ThemePreference>(readStored);
  const [isThemeDark, setIsThemeDark] = React.useState(() => isPatternFlyThemeDark(readStored()));

  React.useLayoutEffect(() => {
    applyPatternFlyTheme(preference);
    setIsThemeDark(isPatternFlyThemeDark(preference));
  }, [preference]);

  React.useEffect(() => {
    if (preference !== 'system') {
      return undefined;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyPatternFlyTheme('system');
      setIsThemeDark(isPatternFlyThemeDark('system'));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = React.useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
    applyPatternFlyTheme(p);
  }, []);

  return { preference, setPreference, isThemeDark };
}
