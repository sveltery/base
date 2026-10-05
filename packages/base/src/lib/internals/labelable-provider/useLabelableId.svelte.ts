// Ported from Base UI v1.8.0 useLabelableId.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';


import { NOOP } from '@sveltery/utils/empty';
import { useLabelableContext } from './LabelableContext.js';
export interface UseLabelableIdParameters { id?: string | null; enabled?: boolean }
export function useLabelableId(params: () => UseLabelableIdParameters, defaultId: string): () => string {
  const context = useLabelableContext();
  const controlSource = Symbol();
  let hasRegistered = false;
  let hadExplicitId = false;
  const unregisterControlId = () => {
    if (!hasRegistered || context.registerControlId === NOOP) return;
    hasRegistered = false;
    context.registerControlId(controlSource, undefined);
  };
  $effect(() => {
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
      context.registerControlId(controlSource, nextId);
    });
  });
  $effect(() => unregisterControlId);
  return () => ((params().enabled ?? true) ? context.controlId : undefined) ?? params().id ?? defaultId;
}
