// Original Base UI 1.8.0 useAnchoredPopupScrollLock, native live-reader boundary (MIT).
import { ownerDocument } from '@sveltery/utils/owner';
import { useScrollLock } from '@sveltery/utils/useScrollLock';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
const VIEWPORT_WIDTH_TOLERANCE_PX = 20;
export function useAnchoredPopupScrollLock(
  getEnabled: () => boolean, getTouchOpen: () => boolean,
  getPositionerElement: () => HTMLElement | null, getReferenceElement: () => Element | null,
) {
  let touchOpenShouldLockScroll = $state(false);
  useIsoLayoutEffect(() => {
    const enabled = getEnabled(); const touchOpen = getTouchOpen(); const positionerElement = getPositionerElement();
    if (!enabled || !touchOpen || positionerElement == null) {
      touchOpenShouldLockScroll = false;
      return;
    }
    const viewportWidth = ownerDocument(positionerElement).documentElement.clientWidth;
    const popupWidth = positionerElement.offsetWidth;
    touchOpenShouldLockScroll = viewportWidth > 0 && popupWidth > 0 && popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX;
  }, () => [getEnabled(), getTouchOpen(), getPositionerElement()]);
  useScrollLock(() => getEnabled() && (!getTouchOpen() || touchOpenShouldLockScroll), getReferenceElement);
}
