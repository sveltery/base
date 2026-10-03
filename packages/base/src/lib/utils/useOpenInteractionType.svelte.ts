// Original selected Base UI v1.8.0 useOpenMethodTriggerProps business body (MIT).
import { useEnhancedClickHandler, type InteractionType } from './useEnhancedClickHandler.js';
import { platform } from './platform/index.js';

export function useOpenMethodTriggerProps(
  open: boolean | (() => boolean),
  setOpenMethod: (interactionType: InteractionType | null) => void,
) {
  return useEnhancedClickHandler((_event, interactionType) => {
    const isOpen = typeof open === 'function' ? open() : open;
    if (!isOpen) {
      // iOS hitslop may emit click without pointerdown, as in the original.
      setOpenMethod(interactionType || (platform.os.ios ? 'touch' : ''));
    }
  });
}
