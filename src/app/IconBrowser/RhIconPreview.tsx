import * as React from 'react';
import type { IconSetName } from '@rhds/icons/icons';

export interface IRhIconPreview {
  iconSet: IconSetName;
  icon: string;
  /** Pixel size for `--rh-icon-size` */
  iconSizePx: number;
  /** When set, CSS `color` on `rh-icon` (`fill: currentcolor` in shadow DOM). Omit to inherit theme. */
  previewColorCss?: string;
  accessibleLabel?: string;
}

/**
 * Renders an rh-icon web component.
 */
const RhIconPreview: React.FunctionComponent<IRhIconPreview> = ({
  iconSet,
  icon,
  iconSizePx,
  previewColorCss,
  accessibleLabel,
}) => {
  const ref = React.useRef<HTMLElement>(null);

  // `rh-icon` is a custom element; reflect optional label imperatively until a stable React prop exists.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (accessibleLabel) {
      el.setAttribute('accessible-label', accessibleLabel);
    } else {
      el.removeAttribute('accessible-label');
    }
  }, [accessibleLabel]);

  const style = React.useMemo(() => {
    const next: Record<string, string> = {
      ['--rh-icon-size']: `${iconSizePx}px`,
    };
    if (previewColorCss !== undefined) {
      next.color = previewColorCss;
    }
    return next as React.CSSProperties;
  }, [iconSizePx, previewColorCss]);

  return <rh-icon ref={ref} style={style} set={iconSet} icon={icon} loading="idle" />;
};

export { RhIconPreview };
