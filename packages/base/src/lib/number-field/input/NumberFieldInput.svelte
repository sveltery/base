<script lang="ts">
  // Actual Base UI v1.8.0 NumberFieldInput business handlers in source order (MIT).
  import { untrack } from 'svelte';
  import { DEV } from 'esm-env';
  import { createLogOnce } from '../../utils/createLogOnce.js';
  import type { HTMLProps } from '../../internals/types.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { formatNumber } from '../../utils/formatNumber.js';
  import { useNumberFieldRootContext } from '../root/NumberFieldRootContext.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext.js';
  import { getNumberLocaleDetails, isNumeralChar, parseNumber, ANY_MINUS_RE, ANY_PLUS_RE, ANY_MINUS_DETECT_RE, ANY_PLUS_DETECT_RE, FORMAT_CONTROL_DETECT_RE } from '../utils/parse.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { useValueChanged } from '../../internals/useValueChanged.svelte.js';
  import { REASONS } from '../../internals/reasons.js';
  import { hasNumberFormatRoundingOptions, removeFloatingPointErrors } from '../utils/validate.js';
  import type { NumberFieldInputProps } from '../types.js';
  const NAVIGATE_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape']);
  const warn = createLogOnce('warn', 'Base UI');
  let { render, class: classProp, style, children, ref = $bindable(), ...elementProps }: NumberFieldInputProps = $props();
  const context = useNumberFieldRootContext();
  const { allowInputSyncRef, formatOptionsRef, getAllowedNonNumericKeys, getStepAmount, incrementValue, setValue, setInputValue, inputRef, onValueCommitted, lastChangedValueRef, hasPendingCommitRef, valueRef } = context;
  const id = $derived(context.id);
  const inputMode = $derived(context.inputMode);
  const max = $derived(context.max);
  const min = $derived(context.min);
  const name = $derived(context.name);
  const locale = $derived(context.locale);
  const inputState = $derived(context.state);
  const { disabled, readOnly, required, value, inputValue } = $derived(inputState);
  const { clearErrors } = useFormContext();
  const field = useFieldRootContext();
  const { setTouched, setFocused, shouldValidateOnChange, validation } = field;
  const validationMode = $derived(field.validationMode);
  const invalid = $derived(field.invalid);
  const labelable = useLabelableContext();
  const labelId = $derived(labelable.labelId);
  const blockRevalidationRef = { current: false };
  const pendingCaretRef = { current: null as number | null };
  useRegisterFieldControl(inputRef, () => id, () => value, undefined, () => !disabled, () => context.nameProp);
  // The post-DOM effect restores the selection after the pasted text has rendered.
  $effect(() => {
    void inputValue;
    untrack(() => {
      if (pendingCaretRef.current != null) {
        const caret = pendingCaretRef.current;
        pendingCaretRef.current = null;
        inputRef.current?.setSelectionRange(caret, caret);
      }
    });
  });
  useValueChanged(() => value, () => () => {
    clearErrors(name);
    if (blockRevalidationRef.current && !shouldValidateOnChange()) {
      blockRevalidationRef.current = false;
      return;
    }
    validation.change(value);
  });
  const inputProps: HTMLProps & HTMLInputAttributes = $derived({
    id,
    required,
    disabled,
    readonly: readOnly,
    inputmode: inputMode,
    value: inputValue,
    type: 'text',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: false,
    'aria-roledescription': 'Number field',
    'aria-invalid': !disabled && invalid ? true : undefined,
    'aria-labelledby': labelId,
    // If the server's locale does not match the client's locale, the formatting may not match,
    // causing a hydration mismatch.
    onfocus(event) {
      // Read-only inputs are still focusable; only the value-changing handlers stay gated on it.
      if (event.defaultPrevented || disabled) {
        return;
      }

      setFocused(true);
    },
    onblur(event) {
      if (event.defaultPrevented || disabled) {
        return;
      }

      // These source comparisons use the numeric value from before this handler's updates.
      // Capture it once so a native live read after setValue cannot clear the revalidation guard.
      const valueBeforeBlur = value;

      setTouched(true);
      setFocused(false);

      if (readOnly) {
        return;
      }

      const hadManualInput = !allowInputSyncRef.current;
      const hadPendingProgrammaticChange = hasPendingCommitRef.current;

      allowInputSyncRef.current = true;

      if (inputValue.trim() === '') {
        const clearDetails = createChangeEventDetails(REASONS.inputClear, event);
        setValue(null, clearDetails);
        // Respect a canceled clear, mirroring the non-empty blur path below.
        if (clearDetails.isCanceled) {
          return;
        }
        if (validationMode === 'onBlur') {
          validation.commit(null);
        }
        // Don't report a commit when blurring an already-empty field that the user never
        // interacted with: nothing was cleared and no programmatic change is pending.
        if (hadManualInput || hadPendingProgrammaticChange || valueBeforeBlur !== null) {
          onValueCommitted(null, createGenericEventDetails(REASONS.inputClear, event));
        }
        return;
      }

      const formatOptions = formatOptionsRef.current;
      const parsedValue = parseNumber(inputValue, locale, formatOptions);
      if (parsedValue === null) {
        return;
      }

      // Avoid applying Intl's default precision unless the format opts into rounding.
      const hasRoundingOptions = hasNumberFormatRoundingOptions(formatOptions);

      let committed: number | null;
      if (!hadManualInput && !hasRoundingOptions) {
        // No rounding options and no manual edit: the visible text is purely formatted
        // display, so keep the authoritative numeric value as-is rather than re-parsing the
        // rounded text and discarding precision (e.g. focus/blur with no edits, or blur after
        // a programmatic change).
        committed = valueBeforeBlur;
      } else if (hasRoundingOptions) {
        // Explicit rounding options apply to the committed value, whether typed or external.
        committed = removeFloatingPointErrors(parsedValue, formatOptions);
      } else {
        committed = parsedValue;
      }

      const nextEventDetails = createGenericEventDetails(REASONS.inputBlur, event);
      const shouldUpdateValue = valueBeforeBlur !== committed;
      const shouldCommit = hadManualInput || shouldUpdateValue || hadPendingProgrammaticChange;

      // Use the stored value after `setValue` clamps it.
      let committedValue = committed;
      if (shouldUpdateValue) {
        const changeDetails = createChangeEventDetails(REASONS.inputBlur, event);
        blockRevalidationRef.current = true;
        setValue(committed, changeDetails);
        if (changeDetails.isCanceled) {
          blockRevalidationRef.current = false;
          return;
        }
        committedValue = lastChangedValueRef.current;
        // If validation normalized back to the current value, `useValueChanged` won't fire to
        // reset the flag, so reset it here or the next external change won't revalidate.
        if (committedValue === valueBeforeBlur) {
          blockRevalidationRef.current = false;
        }
      }
      if (validationMode === 'onBlur') {
        validation.commit(committedValue);
      }
      if (shouldCommit) {
        onValueCommitted(committedValue, nextEventDetails);
      }

      // Normalize only the displayed text
      const canonicalText = formatNumber(committedValue, locale, formatOptions);
      if (inputValue !== canonicalText) {
        setInputValue(canonicalText);
      }
    },
    oninput(event) {
      // Workaround for https://github.com/react/react/issues/9023
      if (event.defaultPrevented) {
        return;
      }

      allowInputSyncRef.current = false;
      const targetValue = event.currentTarget.value;

      if (targetValue.trim() === '') {
        setInputValue(targetValue);
        setValue(null, createChangeEventDetails(REASONS.inputClear, event));
        return;
      }

      // Update the input text immediately and only fire onValueChange if the typed value is
      // currently parseable into a number. This preserves good UX for IME
      // composition/partial input while still providing live numeric updates when possible.
      const allowedNonNumericKeys = getAllowedNonNumericKeys();
      const isValidCharacterString = Array.from(targetValue).every(
        (ch) =>
          isNumeralChar(ch) ||
          ANY_MINUS_DETECT_RE.test(ch) ||
          allowedNonNumericKeys.has(ch) ||
          // Bidi/format controls are stripped by `parseNumber`; don't let them reject the string
          // (RTL locales insert them around exponent/currency signs, e.g. scientific notation).
          FORMAT_CONTROL_DETECT_RE.test(ch),
      );

      if (!isValidCharacterString) {
        return;
      }

      const parsedValue = parseNumber(targetValue, locale, formatOptionsRef.current);

      setInputValue(targetValue);

      if (parsedValue !== null) {
        setValue(parsedValue, createChangeEventDetails(REASONS.inputChange, event));
      }
    },
    onkeydown(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }

      const nativeEvent = event;

      // Snapshot the dirty state without clearing it: navigation/allowed keys (ArrowLeft, Tab,
      // Enter, Escape, …) return early without changing the value, so marking the input synced
      // here would wrongly discard dirty-input authority. Only the value-changing branches below
      // mark it synced.
      const hadManualInput = !allowInputSyncRef.current;

      const allowedNonNumericKeys = getAllowedNonNumericKeys();

      let isAllowedNonNumericKey = allowedNonNumericKeys.has(event.key);

      const { decimal, currency, percentSign } = getNumberLocaleDetails(
        locale,
        formatOptionsRef.current,
      );

      const selectionStart = event.currentTarget.selectionStart;
      const selectionEnd = event.currentTarget.selectionEnd;
      const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.length;

      const selectionContainsIndex = (index: number) =>
        selectionStart != null &&
        selectionEnd != null &&
        index >= selectionStart &&
        index < selectionEnd;

      // Only allow a single sign character: permit it when there is no existing sign of either
      // kind, when all text is selected, or when the selection covers the existing sign so it's
      // being replaced.
      const signGroups = [
        [ANY_MINUS_DETECT_RE, ANY_MINUS_RE],
        [ANY_PLUS_DETECT_RE, ANY_PLUS_RE],
      ] as const;
      signGroups.forEach(([detectRe, globalRe]) => {
        if (
          detectRe.test(event.key) &&
          Array.from(allowedNonNumericKeys).some((k) => detectRe.test(k))
        ) {
          const existingIndex = inputValue.search(globalRe);
          const isReplacingExisting = existingIndex !== -1 && selectionContainsIndex(existingIndex);
          isAllowedNonNumericKey =
            !(ANY_MINUS_DETECT_RE.test(inputValue) || ANY_PLUS_DETECT_RE.test(inputValue)) ||
            isAllSelected ||
            isReplacingExisting;
        }
      });

      // Only allow one of each symbol.
      [decimal, currency, percentSign].forEach((symbol) => {
        if (event.key === symbol) {
          const symbolIndex = inputValue.indexOf(symbol);
          const isSymbolHighlighted = selectionContainsIndex(symbolIndex);
          isAllowedNonNumericKey = symbolIndex === -1 || isAllSelected || isSymbolHighlighted;
        }
      });

      const isNavigateKey = NAVIGATE_KEYS.has(event.key);
      // Alt+ArrowUp/ArrowDown selects smallStep, so don't treat it as a bypass modifier.
      const isStepKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';

      if (
        // Allow composition events (e.g., pinyin)
        // event.isComposing does not work in Safari:
        // https://bugs.webkit.org/show_bug.cgi?id=165004
        event.which === 229 ||
        (event.altKey && !isStepKey) ||
        event.ctrlKey ||
        event.metaKey ||
        isAllowedNonNumericKey ||
        isNumeralChar(event.key) ||
        isNavigateKey
      ) {
        return;
      }

      // Home/End jump to the corresponding bound, but only when that bound is defined.
      let boundaryValue: number | null = null;
      if (event.key === 'Home' && min != null) {
        boundaryValue = min;
      } else if (event.key === 'End' && max != null) {
        boundaryValue = max;
      }

      // Let the browser handle multi-character keys we don't act on (PageUp, Insert, F-keys,
      // Home/End without min/max); invalid single characters are still blocked below.
      if (event.key.length > 1 && !isStepKey && boundaryValue === null) {
        return;
      }

      // Step from the authoritative numeric value unless the input has unsaved manual edits.
      // When the text is already synced, parsing the rounded display would collapse precision,
      // so pass no `currentValue` and let `incrementValue` fall back to the numeric state
      // (mirrors the button path).
      const currentValue = hadManualInput
        ? parseNumber(inputValue, locale, formatOptionsRef.current)
        : null;

      const amount = getStepAmount(event);

      // Prevent insertion of text or caret from moving.
      event.preventDefault();
      event.stopPropagation();

      const commitDetails = createGenericEventDetails(REASONS.keyboard, nativeEvent);

      let changed = false;
      if (isStepKey || boundaryValue !== null) {
        allowInputSyncRef.current = true;
      }
      if (isStepKey) {
        // When stepping from the synced numeric state, refresh the commit ref to the current
        // value so a canceled step can't commit a stale `lastChangedValueRef` left over from an
        // earlier change (mirrors the button path).
        if (!hadManualInput) {
          lastChangedValueRef.current = valueRef.current;
        }

        changed = incrementValue(amount, {
          direction: event.key === 'ArrowUp' ? 1 : -1,
          currentValue,
          event: nativeEvent,
          reason: REASONS.keyboard,
        });
      } else if (boundaryValue !== null) {
        changed = setValue(boundaryValue, createChangeEventDetails(REASONS.keyboard, nativeEvent));
      }

      // `changed` is only true when `setValue` applied the change, which records the stored
      // (clamped/snapped) value, so commit that rather than the pre-validation input.
      if (changed) {
        onValueCommitted(lastChangedValueRef.current, commitDetails);
      }
    },
    onpaste(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }

      let pastedData: string;

      try {
        pastedData = event.clipboardData?.getData('text/plain') ?? '';
      } catch {
        if (DEV) warn('<NumberField.Input> could not read clipboard text during paste handling.');

        return;
      }

      // Prevent `onChange` from being called.
      event.preventDefault();

      // Insert the pasted text at the caret/selection instead of replacing the entire value,
      // matching native input behavior (e.g. pasting "5" into "123|" yields "1235").
      // The component renders `type="text"`, which always reports a selection range. Overriding
      // `type` with a selection-less one (`email`, `number`) is unsupported either way: the caret
      // restore above throws on those, so there is no working behavior to preserve here.
      const input = event.currentTarget;
      const selectionStart = input.selectionStart!;
      const selectionEnd = input.selectionEnd!;
      const nextText =
        inputValue.slice(0, selectionStart) + pastedData + inputValue.slice(selectionEnd);

      const parsedValue = parseNumber(nextText, locale, formatOptionsRef.current);

      if (parsedValue !== null) {
        allowInputSyncRef.current = false;
        pendingCaretRef.current = selectionStart + pastedData.length;
        setValue(parsedValue, createChangeEventDetails(REASONS.inputPaste, event));
        setInputValue(nextText);
      }
    },
  });

</script>
<RenderElement tag="input" componentProps={{ render, class: classProp, style }} params={{ ref: [inputRef], state: inputState, props: [inputProps, elementProps, (props) => validation.getValidationProps(disabled, props)], stateAttributesMapping }} bind:element={ref}>{@render children?.()}</RenderElement>
