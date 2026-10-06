// Base UI v1.8.0 NumberFieldScrubAreaContext, native Svelte context (MIT).
import { getContext, setContext } from 'svelte';
export interface NumberFieldScrubAreaContext {
  readonly isScrubbing: boolean;
  readonly isTouchInput: boolean;
  readonly isPointerLockDenied: boolean;
  scrubAreaCursorRef: { current: HTMLSpanElement | null };
}
const key = Symbol('base-ui-number-field-scrub-area');
export function setNumberFieldScrubAreaContext(context: NumberFieldScrubAreaContext) {
  setContext(key, context);
}
export function useNumberFieldScrubAreaContext(): NumberFieldScrubAreaContext {
  const context = getContext<NumberFieldScrubAreaContext | undefined>(key);
  if (context === undefined)
    throw new Error(
      'Base UI: NumberFieldScrubAreaContext is missing. NumberFieldScrubArea parts must be placed within <NumberField.ScrubArea>.',
    );
  return context;
}
