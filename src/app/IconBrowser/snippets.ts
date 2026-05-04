import type { IconSetName } from '@rhds/icons/icons';

export function rhIconMinimalMarkup(set: IconSetName, icon: string, styleColor?: string): string {
  const setAttr = set === 'standard' ? '' : ` set="${set}"`;
  const styleAttr = styleColor ? ` style="color: ${styleColor}"` : '';
  return `<rh-icon${setAttr} icon="${icon}"${styleAttr} />`;
}
