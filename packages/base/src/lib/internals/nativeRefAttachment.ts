// Native attachment boundary for the shared merged-ref API; MIT provenance in source-correspondence.md.
import { untrack } from 'svelte';
import type { MergedRefCallback } from '../utils/useMergedRefs.js';

const nativeRefAttachmentMarker = Symbol();
type NativeRefAttachment = ((node: Element) => () => void) & {
  [nativeRefAttachmentMarker]: true;
};

/** Only library ref attachments participate in source ref fanout; authored attachments remain native. */
export function isNativeRefAttachment(value: unknown): value is NativeRefAttachment {
  return (
    typeof value === 'function' &&
    (value as NativeRefAttachment)[nativeRefAttachmentMarker] === true
  );
}

/** Native Svelte attachments own attach/detach timing; source fanout owns callback/object ref semantics. */
export function createRefAttachment<Host extends Element>(publish: (node: Host | null, previous?: Host) => void) {
  let previous: MergedRefCallback<Host> | null | undefined;
  let attachment: ((node: Element) => () => void) | undefined;
  return function resolve(callback: MergedRefCallback<Host> | null) {
    if (!attachment || previous !== callback) {
      previous = callback;
      attachment = Object.assign(
        (node: Element) => untrack(() => {
          const host = node as Host;
          publish(host);
          callback?.(host);
          return () => untrack(() => {
            callback?.(null);
            publish(null, host);
          });
        }),
        { [nativeRefAttachmentMarker]: true as const },
      );
    }
    return attachment;
  };
}
