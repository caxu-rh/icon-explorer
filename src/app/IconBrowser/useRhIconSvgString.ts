import * as React from 'react';
import type { IconSetName } from '@rhds/icons/icons';
import { loadRhIconSvgString } from './iconSvg';

/**
 * Loads serialized SVG for a selected RHDS icon, with cancellation on set/icon change.
 */
export function useRhIconSvgString(
  iconSet: IconSetName,
  iconName: string | null,
): {
  svgString: string | null;
  svgLoadError: string | null;
  svgLoading: boolean;
} {
  const [svgString, setSvgString] = React.useState<string | null>(null);
  const [svgLoadError, setSvgLoadError] = React.useState<string | null>(null);
  const [svgLoading, setSvgLoading] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!iconName) {
      setSvgString(null);
      setSvgLoadError(null);
      setSvgLoading(false);
      return;
    }
    setSvgString(null);
    setSvgLoadError(null);
    setSvgLoading(true);
  }, [iconSet, iconName]);

  React.useEffect(() => {
    if (!iconName) {
      return undefined;
    }
    let cancelled = false;
    void loadRhIconSvgString(iconSet, iconName)
      .then((svg) => {
        if (!cancelled) {
          setSvgString(svg);
          setSvgLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSvgLoadError(err instanceof Error ? err.message : 'Could not load SVG.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSvgLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [iconSet, iconName]);

  return { svgString, svgLoadError, svgLoading };
}
