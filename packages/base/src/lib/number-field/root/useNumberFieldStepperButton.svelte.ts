// Source business body from Base UI v1.8.0 useNumberFieldStepperButton.ts (MIT).
import { useButton } from '../../internals/use-button/useButton.svelte.js';
import { isTouchLikePointerType, usePressAndHold } from '../../internals/usePressAndHold.svelte.js';
import { parseNumber } from '../utils/parse.js';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails.js';
import type { EventWithOptionalKeyState } from '../utils/types.js';
import type { NumberFieldRootChangeEventReason } from '../types.js';
import type { HTMLProps } from '../../internals/types.js';
import { REASONS } from '../../internals/reasons.js';
import { useNumberFieldRootContext } from './NumberFieldRootContext.js';
const SELECT_NONE_STYLE = 'user-select:none;-webkit-user-select:none';
export function useNumberFieldStepperButton(getParameters: () => { isIncrement: boolean; disabled: boolean; nativeButton: boolean }) {
  const { isIncrement, disabled: disabledProp, nativeButton } = $derived(getParameters());
  const context = useNumberFieldRootContext();
  const { allowInputSyncRef, formatOptionsRef, getStepAmount, incrementValue, inputRef, focusInput, setValue, valueRef, lastChangedValueRef, onValueCommitted } = context;
  const id = $derived(context.id);
  const maxWithDefault = $derived(context.maxWithDefault);
  const minWithDefault = $derived(context.minWithDefault);
  const state = $derived(context.state);
  const { disabled: contextDisabled, readOnly, value, inputValue } = $derived(state);
  const locale = $derived(context.locale);
  const isAtBoundary = $derived(value != null && (isIncrement ? value >= maxWithDefault : value <= minWithDefault));
  const disabled = $derived(disabledProp || contextDisabled || isAtBoundary);
  const pressReason: NumberFieldRootChangeEventReason = $derived(isIncrement ? REASONS.incrementPress : REASONS.decrementPress);
  function commitValue(nativeEvent: MouseEvent) {
    const shouldCommitInputValue = !allowInputSyncRef.current;
    allowInputSyncRef.current = true;

    if (!shouldCommitInputValue) {
      // The input is already synced, so step from the authoritative numeric value rather than
      // re-parsing the rounded display text. Refresh the commit ref to the current value so a
      // subsequent canceled step can't commit a stale `lastChangedValueRef` left over from an
      // earlier change (the `setValue` that used to refresh it is now skipped on this path).
      lastChangedValueRef.current = valueRef.current;
      return;
    }

    // The input is dirty but not yet blurred, so the value won't have been committed.
    const parsedValue = parseNumber(inputValue, locale, formatOptionsRef.current);

    if (parsedValue !== null) {
      // Sync the dirty typed value with no direction so it isn't directionally snapped
      // (`snapOnStep`) before the real increment/decrement runs, which would otherwise emit a
      // spurious intermediate value.
      const details = createChangeEventDetails(pressReason, nativeEvent);
      setValue(parsedValue, details);

      // Only sync the ref base when the commit wasn't canceled, so a subsequent increment in the
      // same interaction steps from the value actually applied.
      if (!details.isCanceled) {
        valueRef.current = parsedValue;
      }
    }
  }

  const { pointerHandlers, shouldSkipClick } = usePressAndHold(() => ({
    disabled: disabled || readOnly,
    elementRef: inputRef,
    tick(triggerEvent) {
      const amount = getStepAmount(triggerEvent as EventWithOptionalKeyState);
      return incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event: triggerEvent,
        reason: pressReason,
      });
    },
    onStop(nativeEvent: PointerEvent) {
      // `onStop` fires on every release; fall back to the current value when no tick changed it.
      // Step interactions never commit `null`, so the `??` can't mask a legitimate null commit.
      const committed = lastChangedValueRef.current ?? valueRef.current;
      onValueCommitted(committed, createGenericEventDetails(pressReason, nativeEvent));
    },
  }));

  const props: HTMLProps = $derived({
    disabled,
    'aria-label': isIncrement ? 'Increase' : 'Decrease',
    'aria-controls': id,
    // Keyboard users shouldn't have access to the buttons, since they can use the input element
    // to change the value. On the other hand, `aria-hidden` is not applied because touch screen
    // readers should be able to use the buttons.
    tabindex: -1,
    style: SELECT_NONE_STYLE,
    ...pointerHandlers,
    onclick(event: MouseEvent) {
      const isDisabled = disabled || readOnly;
      if (event.defaultPrevented || isDisabled || shouldSkipClick(event)) {
        return;
      }

      commitValue(event);

      const amount = getStepAmount(event);

      const prev = valueRef.current;

      incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event: event,
        reason: pressReason,
      });

      const committed = lastChangedValueRef.current ?? valueRef.current;
      if (committed !== prev) {
        onValueCommitted(committed, createGenericEventDetails(pressReason, event));
      }
    },
    onpointerdown(event: PointerEvent) {
      if (event.defaultPrevented || readOnly || event.button || disabled) {
        return;
      }

      // Sync dirty input value before starting the hold sequence.
      commitValue(event);
      // Treat `lastChangedValueRef` as a per-hold result slot. If the first tick is a no-op or is
      // canceled, `onStop` should fall back to the current value, not a previous interaction.
      lastChangedValueRef.current = null;

      if (!isTouchLikePointerType(event.pointerType)) {
        // Focus the input so the user can continue with keyboard interactions.
        focusInput();
      }

      pointerHandlers.onpointerdown(event);
    },
  });

  const { getButtonProps, buttonRef } = useButton(() => ({
    // Read-only steppers are exposed as unavailable through button disabled semantics, while
    // `data-readonly` (from `state`) is preserved for styling. `aria-readonly` isn't valid on the
    // `button` role, so it's intentionally not set.
    disabled: disabled || readOnly,
    native: nativeButton,
    focusableWhenDisabled: true,
  }));

  const buttonState = $derived({ ...state, disabled });
  return { get props() { return props; }, get state() { return buttonState; }, buttonRef, getButtonProps };
}
