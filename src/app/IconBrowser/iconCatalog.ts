import type { IconSetName } from '@rhds/icons/icons';
import { icons } from '@rhds/icons/metadata.js';
import iconAliases from './iconAliases.json';

/** Per-set map of canonical slug → search-only aliases (see iconAliases.json). */
export type IconAliasMap = Partial<Record<IconSetName, Record<string, string[]>>>;

const ICON_ALIASES = iconAliases as IconAliasMap;

export const ICON_SETS: IconSetName[] = ['standard', 'ui', 'microns', 'social'];

/** Sidebar + document title + in-app headings for each icon set (single source of truth). */
export type IconBrowserSection = 'overview' | IconSetName;

export interface IconSetDisplayMeta {
  navLabel: string;
  docTitle: string;
  description: string;
}

export const ICON_SET_DISPLAY: Record<IconSetName, IconSetDisplayMeta> = {
  standard: {
    navLabel: 'Standard',
    docTitle: 'Standard icons',
    description:
      'Illustrative icons for diagrams, empty states, and marketing visuals (default box ~40px).',
  },
  ui: {
    navLabel: 'UI',
    docTitle: 'UI icons',
    description: 'Dense icons for application chrome, buttons, and tables (default box ~16px).',
  },
  microns: {
    navLabel: 'Microns',
    docTitle: 'Microns',
    description: 'Minimal glyphs for tight UI spaces (8–12px range).',
  },
  social: {
    navLabel: 'Social',
    docTitle: 'Social icons',
    description: 'Brand marks for social and contact links.',
  },
};

export function iconBrowserSectionDocTitle(section: IconBrowserSection): string {
  if (section === 'overview') {
    return 'Overview';
  }
  return ICON_SET_DISPLAY[section].docTitle;
}

export const ICON_BROWSER_NAV_ITEMS: { section: IconBrowserSection; label: string }[] = [
  { section: 'overview', label: 'Overview' },
  ...ICON_SETS.map((set) => ({ section: set, label: ICON_SET_DISPLAY[set].navLabel })),
];

export function getIconNames(set: IconSetName): string[] {
  const names = icons.get(set);
  if (!names) {
    return [];
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

/** O(1) count from package metadata (no sort). */
export function getIconCount(set: IconSetName): number {
  return icons.get(set)?.size ?? 0;
}

/** Which `set` / `icon` to pass to `rh-icon` on overview cards (`RhIconPreview`). */
export interface IconSetRhIconPreview {
  iconSet: IconSetName;
  icon: string;
}

/**
 * Per-set override for the overview thumbnail. Omit a set to use the first icon name in that set
 * from {@link getIconNames}. `iconSet` may differ from the card’s set (e.g. showcase a standard
 * glyph on the microns card).
 */
export const ICON_SET_RH_ICON_PREVIEW: Partial<Record<IconSetName, IconSetRhIconPreview>> = {
  standard: {
    iconSet: 'standard',
    icon: 'interoperability',
  },
  ui: {
    iconSet: 'standard',
    icon: 'apps-multiple',
  },
  microns: {
    iconSet: 'standard',
    icon: 'click',
  },
  social: {
    iconSet: 'standard',
    icon: 'community-people',
  },
};

export function resolveRhIconPreviewForSet(set: IconSetName): IconSetRhIconPreview | null {
  const override = ICON_SET_RH_ICON_PREVIEW[set];
  if (override) {
    return override;
  }
  const names = getIconNames(set);
  const icon = names[0] ?? '';
  if (!icon) {
    return null;
  }
  return { iconSet: set, icon };
}

export function getIconAliases(set: IconSetName, name: string): readonly string[] {
  const row = ICON_ALIASES[set]?.[name];
  return row ?? [];
}

/** Trimmed lowercase query → substring variants (spaces become hyphens so "foo bar" matches slug `foo-bar`). */
export function searchQueryVariants(queryTrimmedLower: string): readonly string[] {
  const hyphenated = queryTrimmedLower.replace(/\s+/g, '-');
  if (hyphenated === queryTrimmedLower) {
    return [queryTrimmedLower];
  }
  return [queryTrimmedLower, hyphenated];
}

function textMatchesAnyVariant(text: string, variants: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return variants.some((v) => lower.includes(v));
}

function iconMatchesQueryVariants(
  set: IconSetName | null,
  name: string,
  variants: readonly string[],
): boolean {
  if (textMatchesAnyVariant(name, variants)) {
    return true;
  }
  if (!set) {
    return false;
  }
  return getIconAliases(set, name).some((a) => textMatchesAnyVariant(a, variants));
}

export function filterIconNames(set: IconSetName | null, names: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return names;
  }
  const variants = searchQueryVariants(q);
  return names.filter((n) => iconMatchesQueryVariants(set, n, variants));
}
