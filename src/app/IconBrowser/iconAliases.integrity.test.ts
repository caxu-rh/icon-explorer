import { describe, expect, it } from 'vitest';
import type { IconSetName } from '@rhds/icons/icons';
import { icons } from '@rhds/icons/metadata.js';
import iconAliases from './iconAliases.json';
import { ICON_SETS, type IconAliasMap } from './iconCatalog';

const map = iconAliases as IconAliasMap;

/** Sets that must list every icon slug from metadata (see scripts/generate-icon-aliases.mjs). */
const FULL_COVERAGE_SETS: IconSetName[] = ['standard', 'ui', 'microns'];

describe('iconAliases.json integrity', () => {
  it('lists every standard, ui, and microns icon with an aliases array', () => {
    for (const set of FULL_COVERAGE_SETS) {
      const names = icons.get(set);
      expect(names).toBeDefined();
      const perSet = map[set];
      expect(perSet, `iconAliases.json missing "${set}" section`).toBeTruthy();
      const keys = Object.keys(perSet!);
      expect(keys.length, `${set}: key count must match metadata`).toBe(names!.size);
      for (const slug of Array.from(names!)) {
        expect(Object.prototype.hasOwnProperty.call(perSet, slug), `missing ${set} icon "${slug}"`).toBe(
          true,
        );
        expect(Array.isArray(perSet![slug]), `${set}/${slug} must be an array`).toBe(true);
      }
    }
  });

  it('does not use any alias string that equals an icon slug in the same set (case-insensitive)', () => {
    for (const set of ICON_SETS) {
      const names = icons.get(set);
      expect(names, `metadata missing set ${set}`).toBeDefined();
      const slugLower = new Set(Array.from(names!).map((n) => n.toLowerCase()));

      const perSet = map[set];
      if (!perSet) {
        continue;
      }

      for (const [canonical, aliases] of Object.entries(perSet)) {
        for (const alias of aliases) {
          expect(
            slugLower.has(alias.toLowerCase()),
            `Alias "${alias}" for ${set}/${canonical} matches an existing icon slug in that set`,
          ).toBe(false);
        }
      }
    }
  });

  it('only references canonical icon slugs that exist in metadata for that set', () => {
    for (const set of ICON_SETS) {
      const names = icons.get(set);
      expect(names).toBeDefined();
      const perSet = map[set];
      if (!perSet) {
        continue;
      }
      for (const canonical of Object.keys(perSet)) {
        expect(
          names!.has(canonical),
          `iconAliases.json references unknown ${set} icon "${canonical}"`,
        ).toBe(true);
      }
    }
  });

  it('lists only non-empty alias strings', () => {
    for (const set of ICON_SETS) {
      const perSet = map[set];
      if (!perSet) {
        continue;
      }
      for (const [canonical, aliases] of Object.entries(perSet)) {
        for (const alias of aliases) {
          expect(alias.trim(), `Empty alias on ${set}/${canonical}`).not.toHaveLength(0);
        }
      }
    }
  });
});
