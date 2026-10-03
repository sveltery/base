// Ported from Base UI v1.8.0 useLabelableId.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { useStableCallback } from '../../utils/useStableCallback.js';
import { useRefWithInit } from '../../utils/useRefWithInit.js';
import { NOOP } from '../../utils/empty.js';
import { useLabelableContext } from './LabelableContext.js';
export interface UseLabelableIdParameters { id?: string | null; enabled?: boolean }
export function useLabelableId(params: () => UseLabelableIdParameters, defaultId: string): () => string {
  const context = useLabelableContext();
  const controlSourceRef = useRefWithInit(() => Symbol());
  let hasRegistered = false;
  let hadExplicitId = false;
  const unregisterControlId = useStableCallback(() => {
    if (!hasRegistered || context.registerControlId === NOOP) return;
    hasRegistered = false;
    context.registerControlId(controlSourceRef.current, undefined);
  });
  useIsoLayoutEffect(() => {
    const { id, enabled = true } = params();
    untrack(() => {
      if (!enabled || context.registerControlId === NOOP) {
        unregisterControlId();
        return;
      }
      let nextId: string | null | undefined;
      if (id !== undefined) { hadExplicitId = true; nextId = id; }
      else if (hadExplicitId) nextId = defaultId;
      else { context.resetControlId(); return; }
      if (nextId === undefined) { unregisterControlId(); return; }
      hasRegistered = true;
      context.registerControlId(controlSourceRef.current, nextId);
    });
  }, () => [params().id, params().enabled ?? true, context.registerControlId, context.resetControlId, defaultId, controlSourceRef, unregisterControlId]);
  useIsoLayoutEffect(() => unregisterControlId, () => [unregisterControlId]);
  return () => ((params().enabled ?? true) ? context.controlId : undefined) ?? params().id ?? defaultId;
}
