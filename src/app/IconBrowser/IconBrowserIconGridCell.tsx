import * as React from 'react';
import type { IconSetName } from '@rhds/icons/icons';
import { Button } from '@patternfly/react-core';
import { RhIconPreview } from './RhIconPreview';

export interface IconBrowserIconGridCellProps {
  iconSet: IconSetName;
  name: string;
  previewIconPx: number;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

const IconBrowserIconGridCell: React.FunctionComponent<IconBrowserIconGridCellProps> = ({
  iconSet,
  name,
  previewIconPx,
  isSelected,
  onSelect,
}) => {
  const onClick = React.useCallback(() => {
    onSelect(name);
  }, [name, onSelect]);

  return (
    <Button
      variant="plain"
      className="icon-browser__cell"
      aria-label={`${name}. Open copy options.`}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <span className="icon-browser__cell-preview">
        <RhIconPreview iconSet={iconSet} icon={name} iconSizePx={previewIconPx} />
      </span>
    </Button>
  );
};

const MemoIconBrowserIconGridCell = React.memo(IconBrowserIconGridCell);
export { MemoIconBrowserIconGridCell as IconBrowserIconGridCell };
