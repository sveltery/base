// Original Base UI 1.8.0 useAnchoredPopupScrollLock, native live-reader boundary (MIT).
import { ownerDocument } from '@sveltery/utils/owner';
import { useScrollLock } from '@sveltery/utils/useScrollLock';

const VIEWPORT_WIDTH_TOLERANCE_PX = 20;
export class AnchoredPopupScrollLock {
  private touchOpenShouldLockScroll = $state(false);

  constructor(
    getEnabled: () => boolean,
    getTouchOpen: () => boolean,
    getPositionerElement: () => HTMLElement | null,
    getReferenceElement: () => Element | null,
  ) {
    $effect(() => {
      const enabled = getEnabled();
      const touchOpen = getTouchOpen();
      const positionerElement = getPositionerElement();
      if (!enabled || !touchOpen || positionerElement == null) {
        this.touchOpenShouldLockScroll = false;
        return;
      }
      const viewportWidth = ownerDocument(positionerElement).documentElement.clientWidth;
      const popupWidth = positionerElement.offsetWidth;
      this.touchOpenShouldLockScroll =
        viewportWidth > 0 &&
        popupWidth > 0 &&
        popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX;
    });
    useScrollLock(
      () => getEnabled() && (!getTouchOpen() || this.touchOpenShouldLockScroll),
      getReferenceElement,
    );
  }
}

export function useAnchoredPopupScrollLock(
  getEnabled: () => boolean,
  getTouchOpen: () => boolean,
  getPositionerElement: () => HTMLElement | null,
  getReferenceElement: () => Element | null,
) {
  return new AnchoredPopupScrollLock(
    getEnabled,
    getTouchOpen,
    getPositionerElement,
    getReferenceElement,
  );
}
