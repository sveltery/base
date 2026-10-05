// Original selected Base UI v1.8.0 useOpenMethodTriggerProps business body (MIT).
import {
  useEnhancedClickHandler,
  type InteractionType,
} from '@sveltery/utils/useEnhancedClickHandler';
import { platform } from '@sveltery/utils/platform';
import { useValueChanged } from '../internals/useValueChanged.svelte.js';

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

/** Original useOpenInteractionType state and close-reset composition. */
export function useOpenInteractionType(getOpen: () => boolean) {
  let openMethod = $state<InteractionType | null>(null);
  const setOpenMethod = (interactionType: InteractionType | null) => {
    openMethod = interactionType;
  };
  const triggerProps = useOpenMethodTriggerProps(getOpen, setOpenMethod);
  useValueChanged(getOpen, () => (previousOpen) => {
    if (previousOpen && !getOpen()) setOpenMethod(null);
  });
  return {
    get openMethod() {
      return openMethod;
    },
    triggerProps,
  };
}
