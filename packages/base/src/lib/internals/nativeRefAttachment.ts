// Native attachment boundary for the shared merged-ref API; MIT provenance in source-correspondence.md.
import { untrack } from 'svelte';
import type { MergedRefCallback } from '../utils/useMergedRefs.js';

/** Native Svelte attachments own attach/detach timing; source fanout owns callback/object ref semantics. */
export function createRefAttachment<Host extends Element>(publish: (node: Host | null, previous?: Host) => void) {
  let previous: MergedRefCallback<Host> | null | undefined;
  let attachment: ((node: Element) => () => void) | undefined;
  return function resolve(callback: MergedRefCallback<Host> | null) {
    if (!attachment || previous !== callback) {
      previous = callback;
      attachment = node => untrack(() => {
        const host = node as Host;
        publish(host);
        callback?.(host);
        return () => untrack(() => {
          callback?.(null);
          publish(null, host);
        });
      });
    }
    return attachment;
  };
}
