/**
 * Resolve the active theme from a settings map.
 * A missing key means "no preference", which falls back to the light theme.
 */

export interface ThemeEntry {
  theme: string;
}

export function themeFor(settings: Map<string, ThemeEntry>, key: string): string {
  const entry = settings.get(key);
  return entry!.theme.toUpperCase();
}
