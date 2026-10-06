import { ownerWindow } from '@sveltery/utils/owner';
// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.

interface ModifierState {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * Dispatches a constructed click on the target so it carries the source event's
 * modifier state, which `click()` always reports as unpressed. Like `click()`,
 * the untrusted click still runs native activation behavior (form submission,
 * link navigation).
 * `detail` defaults to 0 (the native convention for keyboard-generated clicks);
 * pass `detail: 1` when the click represents a mouse gesture so consumers keying
 * off `detail === 0` don't classify it as a keyboard activation.
 */
export function dispatchClickWithModifiers(
  target: Element,
  sourceEvent: ModifierState,
  { detail = 0 }: { detail?: number | undefined } = {},
) {
  target.dispatchEvent(
    new (ownerWindow(target).PointerEvent ?? ownerWindow(target).MouseEvent)('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail,
      shiftKey: sourceEvent.shiftKey,
      ctrlKey: sourceEvent.ctrlKey,
      altKey: sourceEvent.altKey,
      metaKey: sourceEvent.metaKey,
    }),
  );
}
