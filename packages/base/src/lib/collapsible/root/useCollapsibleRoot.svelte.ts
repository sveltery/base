// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import { useControlled } from '../../utils/useControlled.svelte.js';
import { useStableCallback } from '../../utils/useStableCallback.js';
import { useBaseUiId } from '../../internals/useBaseUiId.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
import type { CollapsibleRootChangeEventDetails } from '../types.js';
import type { SetStateAction } from '../../utils/useControlled.svelte.js';

export interface UseCollapsibleRootParameters {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
  disabled: boolean;
}

export function useCollapsibleRoot(getParameters: () => UseCollapsibleRootParameters, nativeId: string) {
  const [open, setOpen] = useControlled(() => ({
    controlled: getParameters().open,
    default: getParameters().defaultOpen ?? false,
    name: 'Collapsible',
    state: 'open',
  }));
  const transition = useTransitionStatus(open, true, true);
  const defaultPanelId = useBaseUiId(undefined, nativeId);
  // undefined uses the generated fallback; null means the panel unmounted.
  let registeredPanelId = $state<string | null | undefined>();
  const panelId = $derived(registeredPanelId === null ? undefined : registeredPanelId ?? defaultPanelId);

  const handleTrigger = useStableCallback((event: MouseEvent | KeyboardEvent) => {
    const nextOpen = !open();
    const eventDetails = createChangeEventDetails('trigger-press', event);
    getParameters().onOpenChange(nextOpen, eventDetails);
    if (eventDetails.isCanceled) return;
    setOpen(nextOpen);
  });

  return {
    defaultPanelId,
    get disabled() { return getParameters().disabled; },
    handleTrigger,
    get mounted() { return transition.mounted; },
    get open() { return open(); },
    get panelId() { return panelId; },
    setMounted: transition.setMounted,
    setOpen,
    setPanelIdState(next: SetStateAction<string | null | undefined>) {
      registeredPanelId = typeof next === 'function' ? next(registeredPanelId) : next;
    },
    get transitionStatus() { return transition.transitionStatus; },
  };
}
export type UseCollapsibleRootReturnValue = ReturnType<typeof useCollapsibleRoot>;
