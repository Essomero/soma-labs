/**
 * Resolve the active theme from a settings map.
 * A missing key means "no preference", which falls back to the light theme.
 */

export function themeFor(settings, key) {
  const entry = settings.get(key);
  return entry.theme.toUpperCase();
}
