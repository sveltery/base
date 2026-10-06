// Original selected Base UI v1.8.0 useOpenMethodTriggerProps business body (MIT).
import {
  useEnhancedClickHandler,
  type InteractionType,
} from '@sveltery/utils/useEnhancedClickHandler';
import { platform } from '@sveltery/utils/platform';
import { ValueChanged } from '../internals/ValueChanged.svelte.js';

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
export class OpenInteractionType {
  private openMethodValue = $state<InteractionType | null>(null);
  readonly triggerProps: ReturnType<typeof useOpenMethodTriggerProps>;

  private readonly setOpenMethod = (interactionType: InteractionType | null) => {
    this.openMethodValue = interactionType;
  };

  get openMethod() {
    return this.openMethodValue;
  }

  constructor(getOpen: () => boolean) {
    this.triggerProps = useOpenMethodTriggerProps(getOpen, this.setOpenMethod);
    new ValueChanged(getOpen, () => (previousOpen) => {
      if (previousOpen && !getOpen()) this.setOpenMethod(null);
    });
  }
}

export function useOpenInteractionType(getOpen: () => boolean) {
  return new OpenInteractionType(getOpen);
}
