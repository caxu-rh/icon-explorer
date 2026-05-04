import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Button,
  Divider,
  Form,
  FormGroup,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  SkipToContent,
  Slider,
  Title,
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import { IconBrowser } from '@app/IconBrowser/IconBrowser';
import { PAGE_MAIN_CONTAINER_ID } from '@app/pageMainId';
import { useDebouncedValue } from '@app/utils/useDebouncedValue';
import type { IconSetName } from '@rhds/icons/icons';
import {
  ICON_BROWSER_NAV_ITEMS,
  ICON_SETS,
  type IconBrowserSection,
  iconBrowserSectionDocTitle,
} from '@app/IconBrowser/iconCatalog';
import { MastheadThemeSwitch } from '@app/IconApp/MastheadThemeSwitch';
import { NotFound } from '@app/NotFound/NotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { usePatternFlyTheme } from '@app/utils/usePatternFlyTheme';

const pathForSection = (section: IconBrowserSection): string => (section === 'overview' ? '/' : `/${section}`);

const sectionFromPath = (pathname: string): IconBrowserSection | null => {
  if (pathname === '/' || pathname === '') {
    return 'overview';
  }
  const seg = pathname.replace(/^\//, '').split('/')[0];
  if (ICON_SETS.includes(seg as IconSetName)) {
    return seg as IconSetName;
  }
  return null;
};

const IconApp: React.FunctionComponent = () => {
  const { preference: themePreference, setPreference: setThemePreference, isThemeDark } = usePatternFlyTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();
  const activeSection = sectionFromPath(location.pathname);

  const [searchQuery, setSearchQuery] = React.useState('');
  React.useEffect(() => {
    setSearchQuery('');
  }, [activeSection]);

  const [iconSizePx, setIconSizePx] = React.useState(32);
  const iconSizePxForGrid = useDebouncedValue(iconSizePx, 120);

  useDocumentTitle(
    activeSection === null
      ? 'Page not found'
      : `${iconBrowserSectionDocTitle(activeSection)} | Icon Explorer`,
  );

  const masthead = (
    <Masthead className="icon-app-masthead">
      <MastheadMain>
        <MastheadToggle>
          <Button
            icon={<BarsIcon />}
            variant="plain"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Global navigation"
          />
        </MastheadToggle>
        <MastheadBrand>
          <Title headingLevel="h2" size="md">
            Icon Explorer
          </Title>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <MastheadThemeSwitch preference={themePreference} onPreferenceChange={setThemePreference} />
      </MastheadContent>
    </Masthead>
  );

  const Navigation = (
    <Nav id="icon-nav" aria-label="Icon sets">
      <NavList>
        {ICON_BROWSER_NAV_ITEMS.map(({ section, label }) => (
          <NavItem key={section} isActive={activeSection !== null && activeSection === section}>
            <NavLink to={pathForSection(section)} end={section === 'overview'}>
              {label}
            </NavLink>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );

  const showIconSizePreview = activeSection !== null && activeSection !== 'overview';

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        {Navigation}
        {showIconSizePreview ? (
          <>
            <Divider />
            <Title headingLevel="h2" size="md">
              Preview
            </Title>
            <Form className="pf-v6-u-mt-md" maxWidth="280px">
              <FormGroup label="Icon size (px)" fieldId="icon-size-slider">
                <Slider
                  value={iconSizePx}
                  min={8}
                  max={64}
                  step={1}
                  onChange={(_e, value) => setIconSizePx(value)}
                  isInputVisible
                  inputValue={iconSizePx}
                />
              </FormGroup>
            </Form>
          </>
        ) : null}
      </PageSidebarBody>
    </PageSidebar>
  );

  const skipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        document.getElementById(PAGE_MAIN_CONTAINER_ID)?.focus();
      }}
      href={`#${PAGE_MAIN_CONTAINER_ID}`}
    >
      Skip to Content
    </SkipToContent>
  );

  if (activeSection === null) {
    return (
      <Page
        mainContainerId={PAGE_MAIN_CONTAINER_ID}
        mainAriaLabel="Icon browser"
        masthead={masthead}
        skipToContent={skipToContent}
      >
        <NotFound />
      </Page>
    );
  }

  return (
    <Page
      mainContainerId={PAGE_MAIN_CONTAINER_ID}
      mainAriaLabel="Icon browser"
      masthead={masthead}
      sidebar={sidebarOpen ? sidebar : undefined}
      skipToContent={skipToContent}
    >
      <IconBrowser
        activeSection={activeSection}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        iconSizePx={iconSizePxForGrid}
        isThemeDark={isThemeDark}
      />
    </Page>
  );
};

export { IconApp };
