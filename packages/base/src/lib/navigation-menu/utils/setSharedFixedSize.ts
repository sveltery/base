// Original Base UI 1.8.0 setSharedFixedSize (MIT).
import * as NavigationMenuPopupCssVars from '../popup/NavigationMenuPopupCssVars.js';
import * as NavigationMenuPositionerCssVars from '../positioner/NavigationMenuPositionerCssVars.js';

export function setSharedFixedSize(
  popupElement: HTMLElement,
  positionerElement: HTMLElement,
  width: number,
  height: number,
) {
  popupElement.style.setProperty(NavigationMenuPopupCssVars.popupWidth, `${width}px`);
  popupElement.style.setProperty(NavigationMenuPopupCssVars.popupHeight, `${height}px`);
  positionerElement.style.setProperty(
    NavigationMenuPositionerCssVars.positionerWidth,
    `${width}px`,
  );
  positionerElement.style.setProperty(
    NavigationMenuPositionerCssVars.positionerHeight,
    `${height}px`,
  );
}
