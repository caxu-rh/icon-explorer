/**
 * Regenerates src/app/IconBrowser/iconAliases.json for standard, ui, and microns:
 * one entry per icon, preserving manual aliases only (search treats spaces as hyphens on slugs).
 *
 * Run: node scripts/generate-icon-aliases.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { icons } from '@rhds/icons/metadata.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/app/IconBrowser/iconAliases.json');

const existing = JSON.parse(fs.readFileSync(target, 'utf8'));

/**
 * @param {string} setName
 * @returns {Record<string, string[]>}
 */
function buildSet(setName) {
  const nameSet = icons.get(setName);
  if (!nameSet) {
    throw new Error(`Unknown set: ${setName}`);
  }
  const slugLower = new Set(Array.from(nameSet).map((s) => s.toLowerCase()));
  const out = {};
  const sorted = Array.from(nameSet).sort((a, b) => a.localeCompare(b));
  const existingForSet = existing[setName] || {};

  for (const slug of sorted) {
    const aliases = [];
    const seenLower = new Set();
    /** Same as searchQueryVariants in iconCatalog: redundant as a manual alias. */
    const spacedSlugForm = slug.includes('-') ? slug.replace(/-/g, ' ') : null;

    const add = (raw) => {
      const t = String(raw).trim();
      if (!t) {
        return;
      }
      const L = t.toLowerCase();
      if (L === slug.toLowerCase()) {
        return;
      }
      if (spacedSlugForm !== null && L === spacedSlugForm.toLowerCase()) {
        return;
      }
      if (slugLower.has(L)) {
        return;
      }
      if (seenLower.has(L)) {
        return;
      }
      seenLower.add(L);
      aliases.push(t);
    };

    for (const a of existingForSet[slug] || []) {
      add(a);
    }

    out[slug] = aliases;
  }

  return out;
}

const next = {
  standard: buildSet('standard'),
  ui: buildSet('ui'),
  microns: buildSet('microns'),
  social: existing.social && typeof existing.social === 'object' ? existing.social : {},
};

fs.writeFileSync(target, `${JSON.stringify(next, null, 2)}\n`);
