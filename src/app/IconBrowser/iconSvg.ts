import type { IconSetName } from '@rhds/icons/icons';

/**
 * Loads the icon module and serializes its root {@link SVGSVGElement} to a string.
 */
export async function loadRhIconSvgString(set: IconSetName, icon: string): Promise<string> {
  const mod = await import(`@rhds/icons/${set}/${icon}.js`);
  const fragment = mod.default as DocumentFragment;
  const el = fragment.firstElementChild;
  if (!(el instanceof SVGSVGElement)) {
    throw new Error('Icon module did not contain an SVG root element.');
  }
  return new XMLSerializer().serializeToString(el);
}

export function svgToUtf8DataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Returns a copy of the SVG markup with `fill` set on the root `<svg>` so paths inherit
 * (package icons typically omit per-path fill). Used for drawer export/copy at a chosen color.
 */
export function svgStringWithRootFill(svg: string, fill: string): string {
  const trimmed = svg.trim();
  const doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml');
  const root = doc.documentElement;
  if (doc.querySelector('parsererror') || !root || root.localName !== 'svg') {
    throw new Error('Invalid SVG string.');
  }
  root.setAttribute('fill', fill);
  return new XMLSerializer().serializeToString(root);
}
