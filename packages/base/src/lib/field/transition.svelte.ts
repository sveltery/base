// Base UI v1.8.0 useTransitionStatus (default options); MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import type { FieldTransitionStatus } from './types.js';
export function createFieldTransition(open: () => boolean, owner: () => HTMLElement | null) {
  let retainedMounted = $state(untrack(open));
  let phase = $state<FieldTransitionStatus>();
  const mounted = $derived(open() || retainedMounted);
  const transitionStatus = $derived(open() && !retainedMounted ? 'starting' : !open() && retainedMounted ? 'ending' : !mounted && phase === 'ending' ? undefined : phase);
  $effect.pre(() => {
    const next = open();
    if (next && !untrack(() => retainedMounted)) {
      retainedMounted = true;
      phase = 'starting';
    }
    if (!next) { if (untrack(() => retainedMounted)) phase = 'ending'; return; }
    const view = owner()?.ownerDocument.defaultView ?? window;
    const frame = view.requestAnimationFrame(() => { if (open()) phase = undefined; });
    return () => view.cancelAnimationFrame(frame);
  });
  return {
    get mounted() { return mounted; }, get transitionStatus() { return transitionStatus; },
    setMounted(value: boolean) { retainedMounted = value; if (!value && !open() && phase === 'ending') phase = undefined; },
  };
}
