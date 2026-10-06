// Native event/binding ordering for the pinned OTP Root/Input handlers.
// MIT: THIRD_PARTY_NOTICES.md. The composed handler remains the sole value owner.
import { on } from 'svelte/events';

export function listenInput(node: HTMLInputElement, getHandler: () => unknown) {
  return {
    destroy: on(node, 'input', (event) => {
      const handler = getHandler() as ((event: Event) => void) | undefined;
      handler?.(event);
    }),
  };
}
