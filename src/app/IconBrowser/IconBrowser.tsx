import * as React from 'react';
import { PageSection, Spinner } from '@patternfly/react-core';
import type { IconBrowserSection } from './iconCatalog';
import { IconBrowserOverview } from './IconBrowserOverview';

const IconBrowserSetViewLazy = React.lazy(() =>
  import('./IconBrowserSetView').then((m) => ({ default: m.IconBrowserSetView })),
);

export type { IconBrowserSection } from './iconCatalog';

export interface IIconBrowserProps {
  activeSection: IconBrowserSection;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  iconSizePx: number;
  /** Used to default drawer icon preview (black in light theme, white in dark). */
  isThemeDark: boolean;
}

const IconBrowser: React.FunctionComponent<IIconBrowserProps> = ({
  activeSection,
  searchQuery,
  onSearchQueryChange,
  iconSizePx,
  isThemeDark,
}) => {
  if (activeSection === 'overview') {
    return <IconBrowserOverview />;
  }
  return (
    <React.Suspense
      fallback={
        <PageSection isWidthLimited={false}>
          <Spinner aria-label="Loading icon browser" />
        </PageSection>
      }
    >
      <IconBrowserSetViewLazy
        iconSet={activeSection}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        iconSizePx={iconSizePx}
        isThemeDark={isThemeDark}
      />
    </React.Suspense>
  );
};

export { IconBrowser };
