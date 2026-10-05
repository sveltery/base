// Ported from Base UI v1.8.0 labelable-provider/useLabel.ts; MIT: THIRD_PARTY_NOTICES.md.
import { ownerDocument } from '../../utils/owner.js';
import { useStableCallback } from '../../utils/useStableCallback.js';
import { getTarget } from '../../utils/shadowDom.js';
import { useRegisteredLabelId } from '../../utils/useRegisteredLabelId.svelte.js';
import { useLabelableContext, type LabelableContext } from './LabelableContext.js';

export interface UseLabelParameters {
  id?: string;
  fallbackControlId?: string;
  native?: boolean;
  setLabelId?: LabelableContext['setLabelId'];
  focusControl?: (event: MouseEvent, controlId: string | null | undefined) => void;
}

export function useLabel(getParams: () => UseLabelParameters, nativeId: string) {
  const context = useLabelableContext();
  const syncLabelId = useStableCallback(
    (nextLabelId: Parameters<LabelableContext['setLabelId']>[0]) => {
      context.setLabelId(nextLabelId);
      getParams().setLabelId?.(nextLabelId);
    },
  );
  const getId = useRegisteredLabelId(() => getParams().id, syncLabelId, nativeId);
  const resolvedControlId = $derived(context.controlId ?? getParams().fallbackControlId);

  function focusControl(event: MouseEvent) {
    if (getParams().focusControl) {
      getParams().focusControl!(event, resolvedControlId);
      return;
    }
    if (!resolvedControlId) return;
    const controlElement = ownerDocument(event.currentTarget as Element).getElementById(
      resolvedControlId,
    );
    // Native realm-safe HTMLElement check replaces @floating-ui/utils/dom's framework dependency.
    const view = controlElement?.ownerDocument.defaultView;
    if (controlElement && view && controlElement instanceof view.HTMLElement) {
      focusElementWithVisible(controlElement);
    }
  }

  function handleInteraction(event: MouseEvent) {
    const target = getTarget(event) as HTMLElement | null;
    if (target?.closest('button,input,select,textarea')) return;
    if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
    if (getParams().native) return;
    focusControl(event);
  }

  const props = $derived(
    getParams().native
      ? {
          id: getId(),
          for: resolvedControlId,
          onmousedown: handleInteraction,
        }
      : {
          id: getId(),
          onclick: handleInteraction,
          onpointerdown(event: PointerEvent) {
            event.preventDefault();
          },
        },
  );
  return () => props;
}

export function focusElementWithVisible(element: HTMLElement) {
  element.focus({ focusVisible: true } as FocusOptions);
}
