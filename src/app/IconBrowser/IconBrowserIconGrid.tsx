import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { IconSetName } from '@rhds/icons/icons';
import { IconBrowserIconGridCell } from './IconBrowserIconGridCell';

export interface IconBrowserIconGridProps {
  iconSet: IconSetName;
  /** Filtered icon names (stable order). */
  names: readonly string[];
  previewIconPx: number;
  selectedIcon: string | null;
  onSelectIcon: (name: string) => void;
  /** For `aria-label` on the grid. */
  gridAriaLabel: string;
}

/** Above this count, mount only visible rows (large sets). */
const VIRTUALIZE_THRESHOLD = 120;

const IconBrowserIconGridDense: React.FunctionComponent<IconBrowserIconGridProps> = ({
  iconSet,
  names,
  previewIconPx,
  selectedIcon,
  onSelectIcon,
  gridAriaLabel,
}) => {
  const gridCellMinPx = previewIconPx + 14;
  const denseGridStyle = React.useMemo(
    () =>
      ({
        gap: 0,
        gridTemplateColumns: `repeat(auto-fill, minmax(${gridCellMinPx}px, 1fr))`,
        gridAutoRows: `minmax(${gridCellMinPx}px, auto)`,
      }) as React.CSSProperties,
    [gridCellMinPx],
  );

  if (names.length === 0) {
    return <div className="icon-browser__dense-grid" aria-label={gridAriaLabel} style={denseGridStyle} />;
  }

  return (
    <div className="icon-browser__dense-grid" aria-label={gridAriaLabel} style={denseGridStyle}>
      {names.map((name) => (
        <IconBrowserIconGridCell
          key={name}
          iconSet={iconSet}
          name={name}
          previewIconPx={previewIconPx}
          isSelected={selectedIcon === name}
          onSelect={onSelectIcon}
        />
      ))}
    </div>
  );
};

const IconBrowserIconGridVirtual: React.FunctionComponent<IconBrowserIconGridProps> = ({
  iconSet,
  names,
  previewIconPx,
  selectedIcon,
  onSelectIcon,
  gridAriaLabel,
}) => {
  const widthObservedRef = React.useRef<HTMLDivElement>(null);
  const scrollportRef = React.useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = React.useState(0);

  const cellMinPx = previewIconPx + 14;

  React.useLayoutEffect(() => {
    const el = widthObservedRef.current;
    if (!el) {
      return undefined;
    }
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setGridWidth(w);
    });
    ro.observe(el);
    setGridWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const columns = gridWidth > 0 ? Math.max(1, Math.floor(gridWidth / cellMinPx)) : 1;
  const rowCount = Math.ceil(names.length / columns);

  const getScrollElement = React.useCallback((): HTMLElement | null => scrollportRef.current, []);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement,
    estimateSize: () => cellMinPx,
    overscan: 6,
    initialRect: { width: 0, height: 480 },
    initialOffset: 0,
  });

  const denseGridStyle = React.useMemo(
    () =>
      ({
        gap: 0,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: `${cellMinPx}px`,
      }) as React.CSSProperties,
    [columns, cellMinPx],
  );

  const totalSize = rowVirtualizer.getTotalSize();
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={widthObservedRef} className="icon-browser__dense-grid icon-browser__dense-grid--virtual">
      <div ref={scrollportRef} className="icon-browser__dense-grid-scrollport">
        {names.length === 0 ? (
          <div className="icon-browser__dense-grid" aria-label={gridAriaLabel} style={denseGridStyle} />
        ) : (
          <div
            className="icon-browser__dense-grid icon-browser__dense-grid--virtual-inner"
            aria-label={gridAriaLabel}
            style={{
              height: totalSize,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const rowIndex = virtualRow.index;
              const rowStart = rowIndex * columns;
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  className="icon-browser__dense-grid icon-browser__dense-grid--virtual-row"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    ...denseGridStyle,
                  }}
                >
                  {Array.from({ length: columns }, (_, col) => {
                    const idx = rowStart + col;
                    if (idx >= names.length) {
                      return <span key={`pad-${rowIndex}-${col}`} style={{ minWidth: 0 }} aria-hidden />;
                    }
                    const name = names[idx]!;
                    return (
                      <IconBrowserIconGridCell
                        key={name}
                        iconSet={iconSet}
                        name={name}
                        previewIconPx={previewIconPx}
                        isSelected={selectedIcon === name}
                        onSelect={onSelectIcon}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const IconBrowserIconGrid: React.FunctionComponent<IconBrowserIconGridProps> = (props) => {
  if (props.names.length <= VIRTUALIZE_THRESHOLD) {
    return <IconBrowserIconGridDense {...props} />;
  }
  return <IconBrowserIconGridVirtual {...props} />;
};

export { IconBrowserIconGrid };
