import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ICON_SETS, ICON_SET_DISPLAY, getIconCount, resolveRhIconPreviewForSet } from './iconCatalog';
import { RhIconPreview } from './RhIconPreview';

const OVERVIEW_CARD_PREVIEW_PX = 40;

const IconBrowserOverview: React.FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <PageSection variant="secondary">
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="2xl">
            Red Hat iconography
          </Title>
        </StackItem>
        <StackItem>
          <Content component={ContentVariants.p}>
            Browse Red Hat Design System icon sets. Pick a set in the sidebar, search by name, then click an icon to
            open a drawer with copy snippets.
          </Content>
          <Content component={ContentVariants.small}>
            Official reference:{' '}
            <a href="https://ux.redhat.com/foundations/iconography/" target="_blank" rel="noreferrer">
              Iconography
            </a>{' '}
            ·{' '}
            <a href="https://ux.redhat.com/elements/icon/code/" target="_blank" rel="noreferrer">
              rh-icon code
            </a>{' '}
            ·{' '}
            <a href="https://ux.redhat.com/elements/icon/guidelines/" target="_blank" rel="noreferrer">
              Guidelines
            </a>
          </Content>
        </StackItem>
        <StackItem>
          <Gallery hasGutter minWidths={{ default: '260px' }}>
            {ICON_SETS.map((set) => {
              const meta = ICON_SET_DISPLAY[set];
              const rhPreview = resolveRhIconPreviewForSet(set);
              const count = getIconCount(set);
              return (
                <GalleryItem key={set} className="pf-v6-u-h-100">
                  <Card id={`overview-set-card-${set}`} isCompact isClickable isFullHeight>
                    <CardHeader
                      selectableActions={{
                        selectableActionAriaLabel: `Browse ${meta.docTitle}`,
                        onClickAction: () => navigate(`/${set}`),
                      }}
                    >
                      <Flex
                        alignItems={{ default: 'alignItemsCenter' }}
                        gap={{ default: 'gapMd' }}
                        flexWrap={{ default: 'nowrap' }}
                      >
                        {rhPreview ? (
                          <FlexItem>
                            <RhIconPreview
                              iconSet={rhPreview.iconSet}
                              icon={rhPreview.icon}
                              iconSizePx={OVERVIEW_CARD_PREVIEW_PX}
                            />
                          </FlexItem>
                        ) : null}
                        <FlexItem grow={{ default: 'grow' }}>
                          <CardTitle component="h3">{meta.docTitle}</CardTitle>
                        </FlexItem>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Content component={ContentVariants.p}>{meta.description}</Content>
                    </CardBody>
                    <CardFooter>
                      <Content component={ContentVariants.small}>
                        {count.toLocaleString()} {count === 1 ? 'icon' : 'icons'}
                      </Content>
                    </CardFooter>
                  </Card>
                </GalleryItem>
              );
            })}
          </Gallery>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export { IconBrowserOverview };
