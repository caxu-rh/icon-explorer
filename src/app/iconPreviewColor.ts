export type IconPreviewColor = 'black' | 'red' | 'white';

/**
 * CSS `color` for `rh-icon` preview (`fill: currentcolor` in shadow DOM).
 * Black/white use RHDS tokens; red stays brand hex for clarity in exports.
 */
export const ICON_PREVIEW_COLOR_CSS: Record<IconPreviewColor, string> = {
  black: 'var(--rh-color-gray-95)',
  red: 'var(--rh-color-red-50)',
  white: 'var(--rh-color-white)',
};

/** Fallbacks when `getComputedStyle` cannot resolve (e.g. tests, non-DOM). Matches @rhds/tokens. */
const PREVIEW_FILL_FALLBACK: Record<string, string> = {
  'var(--rh-color-gray-95)': '#151515',
  'var(--rh-color-white)': '#ffffff',
};

/**
 * Resolves preview `color` / SVG `fill` to a concrete value for rasterizing SVG to PNG
 * (data URLs do not resolve page `var()` tokens on the `<svg>` root).
 */
export function resolveIconPreviewFillForSvgRaster(cssColor: string): string {
  const trimmed = cssColor.trim();
  if (!trimmed.startsWith('var(')) {
    return trimmed;
  }
  if (typeof document === 'undefined') {
    return PREVIEW_FILL_FALLBACK[trimmed] ?? trimmed;
  }
  const el = document.createElement('span');
  el.style.cssText = `position:absolute;left:-9999px;top:0;color:${trimmed}`;
  document.body.appendChild(el);
  const { color } = getComputedStyle(el);
  document.body.removeChild(el);
  if (color && color !== 'rgba(0, 0, 0, 0)' && color !== '') {
    return color;
  }
  return PREVIEW_FILL_FALLBACK[trimmed] ?? trimmed;
}

/** Default drawer preview: dark surfaces → white icon, light → black (RHDS tokens). */
export function iconPreviewColorForTheme(isDark: boolean): IconPreviewColor {
  return isDark ? 'white' : 'black';
}

/** When the glyph matches the page chrome (black/dark, white/light), swap checker tiles to the opposite scheme for contrast. */
export function inverseDrawerCheckerForContrast(
  isThemeDark: boolean,
  iconPreviewColor: IconPreviewColor,
): boolean {
  return (
    (isThemeDark && iconPreviewColor === 'black') || (!isThemeDark && iconPreviewColor === 'white')
  );
}
