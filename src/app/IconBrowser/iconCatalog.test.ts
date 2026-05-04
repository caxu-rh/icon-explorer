import { describe, expect, it, vi } from 'vitest';

vi.mock('./iconAliases.json', () => ({
  default: {
    standard: {
      wifi: ['wireless', '802.11'],
    },
    ui: {
      warning: ['alert', 'caution'],
    },
  },
}));

import {
  ICON_BROWSER_NAV_ITEMS,
  ICON_SETS,
  ICON_SET_DISPLAY,
  ICON_SET_RH_ICON_PREVIEW,
  filterIconNames,
  getIconAliases,
  iconBrowserSectionDocTitle,
  resolveRhIconPreviewForSet,
  searchQueryVariants,
} from './iconCatalog';

describe('icon set display metadata', () => {
  it('exposes a nav item for overview plus every catalog set', () => {
    expect(ICON_BROWSER_NAV_ITEMS.map((i) => i.section)).toEqual(['overview', ...ICON_SETS]);
  });

  it('keeps doc titles aligned with display records for each set', () => {
    for (const set of ICON_SETS) {
      expect(iconBrowserSectionDocTitle(set)).toBe(ICON_SET_DISPLAY[set].docTitle);
    }
    expect(iconBrowserSectionDocTitle('overview')).toBe('Overview');
  });
});

describe('searchQueryVariants', () => {
  it('returns a single variant when the query has no spaces', () => {
    expect(searchQueryVariants('wifi')).toEqual(['wifi']);
    expect(searchQueryVariants('arrow-down')).toEqual(['arrow-down']);
  });

  it('adds a hyphenated variant when the query contains whitespace', () => {
    expect(searchQueryVariants('arrow down')).toEqual(['arrow down', 'arrow-down']);
    expect(searchQueryVariants('a  b')).toEqual(['a  b', 'a-b']);
  });
});

describe('getIconAliases', () => {
  it('returns aliases for a known icon in a set', () => {
    expect(getIconAliases('standard', 'wifi')).toEqual(['wireless', '802.11']);
  });

  it('returns empty array when the icon has no aliases', () => {
    expect(getIconAliases('standard', 'wrench')).toEqual([]);
  });

  it('returns empty array when the set has no alias map', () => {
    expect(getIconAliases('microns', 'wifi')).toEqual([]);
  });
});

describe('resolveRhIconPreviewForSet', () => {
  it('returns a non-empty preview for every catalog set', () => {
    for (const set of ICON_SETS) {
      const r = resolveRhIconPreviewForSet(set);
      expect(r).not.toBeNull();
      expect(r!.icon.length).toBeGreaterThan(0);
      if (!ICON_SET_RH_ICON_PREVIEW[set]) {
        expect(r!.iconSet).toBe(set);
      }
    }
  });
});

describe('filterIconNames', () => {
  const standardNames = ['wifi', 'wrench'];

  it('returns all names when query is empty', () => {
    expect(filterIconNames('standard', standardNames, '')).toEqual(standardNames);
    expect(filterIconNames('standard', standardNames, '   ')).toEqual(standardNames);
  });

  it('matches canonical slug substring', () => {
    expect(filterIconNames('standard', standardNames, 'wre')).toEqual(['wrench']);
  });

  it('treats spaces in the query like hyphens for slug substring match', () => {
    const names = ['agile-integration', 'wifi', 'wrench'];
    expect(filterIconNames('standard', names, 'agile integration')).toEqual(['agile-integration']);
    expect(filterIconNames('standard', names, 'agile  integration')).toEqual(['agile-integration']);
    expect(filterIconNames('standard', names, 'agile-integration')).toEqual(['agile-integration']);
  });

  it('matches when query appears only in an alias', () => {
    expect(filterIconNames('standard', standardNames, 'wireless')).toEqual(['wifi']);
    expect(filterIconNames('standard', standardNames, '802')).toEqual(['wifi']);
  });

  it('does not use another set’s aliases', () => {
    expect(filterIconNames('ui', ['warning', 'info'], 'wireless')).toEqual([]);
    expect(filterIconNames('ui', ['warning', 'info'], 'alert')).toEqual(['warning']);
  });

  it('with null set, only canonical names match', () => {
    expect(filterIconNames(null, standardNames, 'wireless')).toEqual([]);
    expect(filterIconNames(null, standardNames, 'wifi')).toEqual(['wifi']);
  });
});
