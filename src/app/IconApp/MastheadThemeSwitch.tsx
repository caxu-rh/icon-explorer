import * as React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import DesktopIcon from '@patternfly/react-icons/dist/esm/icons/desktop-icon';
import OutlinedMoonIcon from '@patternfly/react-icons/dist/esm/icons/outlined-moon-icon';
import OutlinedSunIcon from '@patternfly/react-icons/dist/esm/icons/outlined-sun-icon';
import type { ThemePreference } from '@app/utils/usePatternFlyTheme';

const THEME_LABEL: Record<ThemePreference, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System preference',
};

const THEME_TOGGLE_LABEL: Record<ThemePreference, string> = {
  light: 'Color theme: light mode',
  dark: 'Color theme: dark mode',
  system: 'Color theme: system preference',
};

export interface IMastheadThemeSwitchProps {
  preference: ThemePreference;
  onPreferenceChange: (p: ThemePreference) => void;
}

export const MastheadThemeSwitch: React.FunctionComponent<IMastheadThemeSwitchProps> = ({
  preference,
  onPreferenceChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIcon =
    preference === 'light' ? (
      <OutlinedSunIcon />
    ) : preference === 'dark' ? (
      <OutlinedMoonIcon />
    ) : (
      <DesktopIcon />
    );

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value?: string | number) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      onPreferenceChange(value);
    }
    setIsOpen(false);
  };

  return (
    <Toolbar id="masthead-theme-toolbar" isStatic>
      <ToolbarContent>
        <ToolbarGroup align={{ default: 'alignEnd' }} variant="action-group-plain">
          <ToolbarItem>
            <Dropdown
              isPlain
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              onSelect={onSelect}
              popperProps={{ position: 'end' }}
              shouldFocusToggleOnSelect
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="plain"
                  aria-label={THEME_TOGGLE_LABEL[preference]}
                  isExpanded={isOpen}
                  onClick={() => setIsOpen((o) => !o)}
                  icon={toggleIcon}
                />
              )}
            >
              <DropdownList aria-label="Color theme options">
                <DropdownItem value="light" key="light" isSelected={preference === 'light'} icon={<OutlinedSunIcon />}>
                  {THEME_LABEL.light}
                </DropdownItem>
                <DropdownItem value="dark" key="dark" isSelected={preference === 'dark'} icon={<OutlinedMoonIcon />}>
                  {THEME_LABEL.dark}
                </DropdownItem>
                <DropdownItem
                  value="system"
                  key="system"
                  isSelected={preference === 'system'}
                  icon={<DesktopIcon />}
                >
                  {THEME_LABEL.system}
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};
