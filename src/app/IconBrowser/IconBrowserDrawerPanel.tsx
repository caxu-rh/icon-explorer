import * as React from 'react';
import type { IconSetName } from '@rhds/icons/icons';
import {
  Alert,
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  ContentVariants,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  FormGroup,
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import type { IconPreviewColor } from '@app/iconPreviewColor';
import { RhIconPreview } from './RhIconPreview';
import { pngExportErrorMessage, runPng512Export } from './drawerExportActions';
import { rhIconMinimalMarkup } from './snippets';
import { svgToUtf8DataUrl } from './iconSvg';
import { triggerBlobDownload } from './svgToPng512';

const DRAWER_PREVIEW_PX = 128;
/** Checkerboard frame around the drawer icon (not the full 512px “image editor” box). */
const DRAWER_PREVIEW_FRAME_GUTTER_PX = 12;

export interface IconBrowserDrawerSvgExport {
  loading: boolean;
  loadError: string | null;
  exportString: string | null;
  rasterString: string | null;
}

export interface IconBrowserDrawerPngExport {
  error: string | null;
  downloading: boolean;
  copyingDataUrl: boolean;
  onError: (message: string | null) => void;
  onDownloading: (value: boolean) => void;
  onCopyingDataUrl: (value: boolean) => void;
}

function snippetCopyHandler(onAnnounceCopy: () => void) {
  return (_e: React.ClipboardEvent<HTMLDivElement>, text?: React.ReactNode) => {
    void navigator.clipboard.writeText(String(text ?? ''));
    onAnnounceCopy();
  };
}

export interface IIconBrowserDrawerPanelProps {
  selectedIcon: string;
  iconSet: IconSetName;
  drawerPanelHeadingRef: React.Ref<HTMLDivElement>;
  onClose: () => void;
  drawerPreviewInverseChecker: boolean;
  iconPreviewColor: IconPreviewColor;
  onIconPreviewColorChange: (color: IconPreviewColor) => void;
  copyNotice: string | null;
  onAnnounceCopy: () => void;
  previewColorCss: string;
  svgExport: IconBrowserDrawerSvgExport;
  pngExport: IconBrowserDrawerPngExport;
}

const IconBrowserDrawerPanel: React.FunctionComponent<IIconBrowserDrawerPanelProps> = ({
  selectedIcon,
  iconSet,
  drawerPanelHeadingRef,
  onClose,
  drawerPreviewInverseChecker,
  iconPreviewColor,
  onIconPreviewColorChange,
  copyNotice,
  onAnnounceCopy,
  previewColorCss,
  svgExport,
  pngExport,
}) => {
  const { loading: svgLoading, loadError: svgLoadError, exportString, rasterString } = svgExport;
  const {
    error: pngDownloadError,
    downloading: pngDownloading,
    copyingDataUrl: pngCopyingDataUrl,
    onError: onPngDownloadError,
    onDownloading: onPngDownloading,
    onCopyingDataUrl: onPngCopyingDataUrl,
  } = pngExport;

  const pngDisabledBase =
    !rasterString || Boolean(svgLoadError) || svgLoading || pngDownloading || pngCopyingDataUrl;

  const runPng = (mode: 'copyDataUrl' | 'download') => {
    if (!rasterString || svgLoadError || svgLoading) {
      return;
    }
    onPngDownloadError(null);
    if (mode === 'copyDataUrl') {
      onPngCopyingDataUrl(true);
    } else {
      onPngDownloading(true);
    }
    const filename = `${iconSet}-${selectedIcon}.png`;
    void (async () => {
      try {
        await runPng512Export(rasterString, mode, filename);
        if (mode === 'copyDataUrl') {
          onAnnounceCopy();
        }
      } catch (err: unknown) {
        onPngDownloadError(pngExportErrorMessage(err));
      } finally {
        if (mode === 'copyDataUrl') {
          onPngCopyingDataUrl(false);
        } else {
          onPngDownloading(false);
        }
      }
    })();
  };

  return (
    <DrawerPanelContent
      className="icon-browser__drawer-panel"
      defaultSize="min(30rem, 96vw)"
      minSize="min(20rem, 100%)"
      colorVariant="secondary"
      focusTrap={{ enabled: true }}
    >
      <DrawerHead>
        <Flex
          flexWrap={{ default: 'wrap' }}
          gap={{ default: 'gapMd' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          style={{ flex: 1, minWidth: 0 }}
        >
          <FlexItem>
            <div
              className={
                drawerPreviewInverseChecker
                  ? 'icon-browser__drawer-preview icon-browser__drawer-preview--inverse-checker'
                  : 'icon-browser__drawer-preview'
              }
              aria-hidden="true"
              style={{
                width: DRAWER_PREVIEW_PX + 2 * DRAWER_PREVIEW_FRAME_GUTTER_PX,
              }}
            >
              <RhIconPreview
                iconSet={iconSet}
                icon={selectedIcon}
                iconSizePx={DRAWER_PREVIEW_PX}
                previewColorCss={previewColorCss}
              />
            </div>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div tabIndex={-1} ref={drawerPanelHeadingRef}>
              <Content component={ContentVariants.h1}>
                {selectedIcon}
              </Content>
            </div>
          </FlexItem>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Stack hasGutter>
          {copyNotice && (
            <StackItem>
              <Alert variant="success" title={copyNotice} isLiveRegion />
            </StackItem>
          )}
          <StackItem>
            <FormGroup label="Icon color" fieldId="drawer-icon-preview-color">
              <ToggleGroup aria-label="Icon preview color" isCompact>
                <ToggleGroupItem
                  text="Black"
                  isSelected={iconPreviewColor === 'black'}
                  onChange={(_event, isSelected) => isSelected && onIconPreviewColorChange('black')}
                />
                <ToggleGroupItem
                  text="Red"
                  isSelected={iconPreviewColor === 'red'}
                  onChange={(_event, isSelected) => isSelected && onIconPreviewColorChange('red')}
                />
                <ToggleGroupItem
                  text="White"
                  isSelected={iconPreviewColor === 'white'}
                  onChange={(_event, isSelected) => isSelected && onIconPreviewColorChange('white')}
                />
              </ToggleGroup>
            </FormGroup>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.h3}>JSX</Content>
            <ClipboardCopy
              className="pf-v6-u-mt-sm"
              variant={ClipboardCopyVariant.inlineCompact}
              hoverTip="Copy"
              clickTip="Copied!"
              isCode
              onCopy={snippetCopyHandler(onAnnounceCopy)}
            >
              {rhIconMinimalMarkup(iconSet, selectedIcon, previewColorCss)}
            </ClipboardCopy>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.h3}>SVG</Content>
            {svgLoading && (
              <Content className="pf-v6-u-mt-sm" component={ContentVariants.small}>
                Preparing copy action…
              </Content>
            )}
            {svgLoadError && !svgLoading && (
              <Alert className="pf-v6-u-mt-sm" variant="danger" title={svgLoadError} />
            )}
            {exportString && !svgLoading && (
              <>
                <Flex className="pf-v6-u-mt-sm" gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                  <FlexItem>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        void navigator.clipboard.writeText(exportString);
                        onAnnounceCopy();
                      }}
                    >
                      Copy SVG
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        void navigator.clipboard.writeText(svgToUtf8DataUrl(exportString));
                        onAnnounceCopy();
                      }}
                    >
                      Copy data URL
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      className="pf-v6-u-mt-sm"
                      variant="secondary"
                      onClick={() =>
                        triggerBlobDownload(
                          new Blob([exportString], { type: 'image/svg+xml' }),
                          `${iconSet}-${selectedIcon}.svg`,
                        )
                      }
                    >
                      Download SVG
                    </Button>
                  </FlexItem>
                </Flex>
              </>
            )}
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.h3}>PNG</Content>
            {pngDownloadError && (
              <Alert className="pf-v6-u-mt-sm" variant="danger" title={pngDownloadError} />
            )}
            <Flex className="pf-v6-u-mt-sm" gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem>
                <Button
                  variant="secondary"
                  aria-label="Copy data URL (PNG)"
                  isLoading={pngCopyingDataUrl}
                  spinnerAriaValueText="Generating PNG"
                  isDisabled={pngDisabledBase}
                  onClick={() => runPng('copyDataUrl')}
                >
                  Copy data URL
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="secondary"
                  isLoading={pngDownloading}
                  spinnerAriaValueText="Generating PNG"
                  isDisabled={pngDisabledBase}
                  onClick={() => runPng('download')}
                >
                  Download PNG
                </Button>
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export { IconBrowserDrawerPanel };
