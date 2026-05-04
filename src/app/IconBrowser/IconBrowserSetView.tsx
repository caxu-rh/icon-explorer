import * as React from 'react';
import type { IconSetName } from '@rhds/icons/icons';
import {
  Content,
  ContentVariants,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  SearchInput,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ICON_PREVIEW_COLOR_CSS,
  type IconPreviewColor,
  iconPreviewColorForTheme,
  inverseDrawerCheckerForContrast,
  resolveIconPreviewFillForSvgRaster,
} from '@app/iconPreviewColor';
import { useDebouncedValue } from '@app/utils/useDebouncedValue';
import { ICON_SET_DISPLAY, filterIconNames, getIconNames } from './iconCatalog';
import { IconBrowserDrawerPanel } from './IconBrowserDrawerPanel';
import { IconBrowserIconGrid } from './IconBrowserIconGrid';
import { svgStringWithRootFill } from './iconSvg';
import { useRhIconSvgString } from './useRhIconSvgString';

/** Matches IconApp slider (8–64). */
const SLIDER_ICON_MIN_PX = 8;
const SLIDER_ICON_MAX_PX = 64;

type PngPanelState = {
  error: string | null;
  downloading: boolean;
  copyingDataUrl: boolean;
};

type PngPanelAction =
  | { type: 'reset' }
  | { type: 'error'; message: string | null }
  | { type: 'downloading'; value: boolean }
  | { type: 'copyingDataUrl'; value: boolean };

function pngPanelReducer(state: PngPanelState, action: PngPanelAction): PngPanelState {
  switch (action.type) {
    case 'reset':
      return { error: null, downloading: false, copyingDataUrl: false };
    case 'error':
      return { ...state, error: action.message };
    case 'downloading':
      return { ...state, downloading: action.value };
    case 'copyingDataUrl':
      return { ...state, copyingDataUrl: action.value };
    default:
      return state;
  }
}

export interface IconBrowserSetViewProps {
  iconSet: IconSetName;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  iconSizePx: number;
  isThemeDark: boolean;
}

const IconBrowserSetView: React.FunctionComponent<IconBrowserSetViewProps> = ({
  iconSet,
  searchQuery,
  onSearchQueryChange,
  iconSizePx,
  isThemeDark,
}) => {
  const meta = ICON_SET_DISPLAY[iconSet];

  const [iconPreviewColor, setIconPreviewColor] = React.useState<IconPreviewColor>(() =>
    iconPreviewColorForTheme(isThemeDark),
  );
  React.useEffect(() => {
    setIconPreviewColor(iconPreviewColorForTheme(isThemeDark));
  }, [isThemeDark]);

  const [copyNotice, setCopyNotice] = React.useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
  const [pngPanel, dispatchPng] = React.useReducer(pngPanelReducer, {
    error: null,
    downloading: false,
    copyingDataUrl: false,
  });

  React.useLayoutEffect(() => {
    setSelectedIcon(null);
  }, [iconSet]);

  const drawerPanelHeadingRef = React.useRef<HTMLDivElement>(null);

  const { svgString, svgLoadError, svgLoading } = useRhIconSvgString(iconSet, selectedIcon);

  React.useLayoutEffect(() => {
    dispatchPng({ type: 'reset' });
  }, [selectedIcon, iconSet]);

  const previewColorCss = ICON_PREVIEW_COLOR_CSS[iconPreviewColor];
  const previewFillForRaster = React.useMemo(
    () => resolveIconPreviewFillForSvgRaster(previewColorCss),
    [previewColorCss],
  );
  const drawerSvgFilled = React.useMemo(() => {
    if (!svgString) {
      return { exportString: null as string | null, rasterString: null as string | null };
    }
    return {
      exportString: svgStringWithRootFill(svgString, previewColorCss),
      rasterString: svgStringWithRootFill(svgString, previewFillForRaster),
    };
  }, [svgString, previewColorCss, previewFillForRaster]);

  React.useEffect(() => {
    if (!copyNotice) {
      return;
    }
    const t = window.setTimeout(() => setCopyNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [copyNotice]);

  const announceCopy = React.useCallback(() => {
    setCopyNotice('Copied to clipboard.');
  }, []);

  const allNames = React.useMemo(() => getIconNames(iconSet), [iconSet]);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 160);
  const filtered = React.useMemo(
    () => filterIconNames(iconSet, allNames, debouncedSearchQuery),
    [iconSet, allNames, debouncedSearchQuery],
  );
  const filteredSet = React.useMemo(() => new Set(filtered), [filtered]);

  React.useEffect(() => {
    if (selectedIcon && !filteredSet.has(selectedIcon)) {
      setSelectedIcon(null);
    }
  }, [filteredSet, selectedIcon]);

  const closeDrawer = React.useCallback(() => {
    setSelectedIcon(null);
  }, []);

  const onDrawerExpand = React.useCallback(() => {
    drawerPanelHeadingRef.current?.focus();
  }, []);

  const onSelectIcon = React.useCallback((name: string) => {
    setSelectedIcon(name);
  }, []);

  const previewIconPx = Math.min(SLIDER_ICON_MAX_PX, Math.max(SLIDER_ICON_MIN_PX, iconSizePx));

  const drawerPreviewInverseChecker = inverseDrawerCheckerForContrast(isThemeDark, iconPreviewColor);

  const panelContent =
    selectedIcon !== null ? (
      <IconBrowserDrawerPanel
        selectedIcon={selectedIcon}
        iconSet={iconSet}
        drawerPanelHeadingRef={drawerPanelHeadingRef}
        onClose={closeDrawer}
        drawerPreviewInverseChecker={drawerPreviewInverseChecker}
        iconPreviewColor={iconPreviewColor}
        onIconPreviewColorChange={setIconPreviewColor}
        copyNotice={copyNotice}
        onAnnounceCopy={announceCopy}
        previewColorCss={previewColorCss}
        svgExport={{
          loading: svgLoading,
          loadError: svgLoadError,
          exportString: drawerSvgFilled.exportString,
          rasterString: drawerSvgFilled.rasterString,
        }}
        pngExport={{
          error: pngPanel.error,
          downloading: pngPanel.downloading,
          copyingDataUrl: pngPanel.copyingDataUrl,
          onError: (message) => dispatchPng({ type: 'error', message }),
          onDownloading: (value) => dispatchPng({ type: 'downloading', value }),
          onCopyingDataUrl: (value) => dispatchPng({ type: 'copyingDataUrl', value }),
        }}
      />
    ) : null;

  return (
    <PageSection isWidthLimited={false}>
      <Drawer className="icon-browser__drawer" isExpanded={Boolean(selectedIcon)} onExpand={onDrawerExpand}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h1" size="2xl">
                  {meta.docTitle}
                </Title>
                <Content component={ContentVariants.p}>
                  {meta.description}
                </Content>
                <Content component={ContentVariants.small} className="pf-v6-u-mt-sm">
                  Click an icon to open a drawer with copy options.
                </Content>
              </StackItem>
              <StackItem>
                <Toolbar id="icon-toolbar">
                  <ToolbarContent>
                    <ToolbarItem>
                      <SearchInput
                        placeholder={`Search ${allNames.length} icons…`}
                        value={searchQuery}
                        onChange={(_e, value) => onSearchQueryChange(value)}
                        onClear={() => onSearchQueryChange('')}
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              </StackItem>
              <StackItem>
                <IconBrowserIconGrid
                  iconSet={iconSet}
                  names={filtered}
                  previewIconPx={previewIconPx}
                  selectedIcon={selectedIcon}
                  onSelectIcon={onSelectIcon}
                  gridAriaLabel={`${meta.docTitle} grid`}
                />
              </StackItem>
            </Stack>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </PageSection>
  );
};

export { IconBrowserSetView };
