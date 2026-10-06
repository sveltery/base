<script lang="ts">
  // Source business body from Base UI v1.8.0 NumberFieldRoot.tsx (MIT).
  import { untrack } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { addEventListener } from '@sveltery/utils/addEventListener';
  import { platform } from '@sveltery/utils/platform';
  import { formatNumber } from '@sveltery/utils/formatNumber';
  import { ownerDocument } from '@sveltery/utils/owner';
  import { activeElement } from '@sveltery/utils/shadowDom';
  import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useFieldControlNativeName } from '../../internals/field-control-name/FieldControlNameContext.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useLabelableId } from '../../internals/labelable-provider/useLabelableId.svelte.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import {
    getFormatParts,
    getNumberLocaleDetails,
    PERMILLE,
    PERCENTAGES,
    SPACE_SEPARATOR_RE,
    BASE_NON_NUMERIC_SYMBOLS,
    MINUS_SIGNS_WITH_ASCII,
    PLUS_SIGNS_WITH_ASCII,
  } from '../utils/parse.js';
  import { toValidatedNumber } from '../utils/validate.js';
  import type { EventWithOptionalKeyState, IncrementValueParameters } from '../utils/types.js';
  import {
    createChangeEventDetails,
    createGenericEventDetails,
    type ReasonToEvent,
  } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { setNumberFieldRootContext, type InputMode } from './NumberFieldRootContext.js';
  import type {
    NumberFieldRootProps,
    NumberFieldRootState,
    NumberFieldRootChangeEventDetails,
    NumberFieldRootCommitEventDetails,
  } from '../types.js';
  let {
    id: idProp,
    min,
    max,
    smallStep = 0.1,
    step: stepProp = 1,
    largeStep = 10,
    required = false,
    disabled: disabledProp = false,
    readOnly = false,
    form,
    name: nameProp,
    defaultValue: defaultValueProp,
    value: valueProp,
    onValueChange: onValueChangeProp,
    onValueCommitted: onValueCommittedProp,
    allowWheelScrub = false,
    snapOnStep = false,
    allowOutOfRange = false,
    format,
    locale,
    render,
    class: classProp,
    inputRef: inputRefProp = $bindable(),
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: NumberFieldRootProps = $props();
  const field = useFieldRootContext();
  const { clearErrors } = useFormContext();
  const { setDirty, setFilled, validation } = field;
  const disabled = $derived(Boolean(field.disabled || disabledProp));
  const name = $derived(field.name ?? nameProp);
  const getNativeName = useFieldControlNativeName();
  const nativeName = $derived(getNativeName(name));
  const step = $derived(stepProp === 'any' ? 1 : stepProp);
  const minWithDefault = $derived(min ?? Number.MIN_SAFE_INTEGER);
  const maxWithDefault = $derived(max ?? Number.MAX_SAFE_INTEGER);
  const minWithZeroDefault = $derived(min ?? 0);
  const formatStyle = $derived(format?.style);
  const validityData = $derived(field.validityData);
  let isScrubbing = $state(false);
  const inputRef = $state<{ current: HTMLInputElement | null }>({ current: null });
  const instanceId = $props.id();
  const getId = useLabelableId(() => ({ id: idProp }), useBaseUiId(undefined, instanceId));
  const id = $derived(getId());
  const valueState = new Controlled<number | null>(
    () => valueProp,
    untrack(() => defaultValueProp ?? null),
  );
  const value = $derived(valueState.value);
  // Source useValueAsRef reads the rendered numeric value, with one deliberate
  // same-interaction write in commitValue. Native live reads keep consecutive DOM
  // handlers current; the transient slot preserves that dirty-step write until DOM sync.
  let transientValue: number | null | undefined;
  const valueRef = {
    get current() {
      return transientValue === undefined ? value : transientValue;
    },
    set current(next: number | null) {
      transientValue = next;
    },
  };
  const formatOptionsRef = {
    get current() {
      return format;
    },
  };
  const hasPendingCommitRef = { current: false };
  const allowInputSyncRef = { current: true };
  const lastChangedValueRef = { current: null as number | null };
  let inputValue = $state(untrack(() => formatNumber(value, locale, format)));
  let inputMode = $state<InputMode>('numeric');
  function setInputValue(next: string) {
    inputValue = next;
  }
  const onValueCommitted = (
    nextValue: number | null,
    details: NumberFieldRootCommitEventDetails,
  ) => {
    hasPendingCommitRef.current = false;
    onValueCommittedProp?.(nextValue, details);
  };
  $effect(() => {
    const next = value;
    void inputValue;
    untrack(() => {
      transientValue = undefined;
      setFilled(next !== null);
    });
  });
  const getAllowedNonNumericKeys = () => {
    const parts = getFormatParts(locale, format);

    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- This pure per-call source whitelist is not reactive component state.
    const keys = new Set<string>(BASE_NON_NUMERIC_SYMBOLS);
    const addAll = (chars: readonly string[]) => chars.forEach((char) => keys.add(char));

    // Integer formats omit the decimal from `parts`, so fall back to the locale's separator in that
    // case; it must stay typeable regardless of whether the format renders a fraction.
    const decimal =
      parts.find((part) => part.type === 'decimal')?.value ??
      getNumberLocaleDetails(locale, format).decimal;
    keys.add(decimal);

    // Allow every non-digit character the formatter renders — separators, currency symbols, units
    // (e.g. `km/h`, `°C`), exponent separators, and locale literals — decomposed per character
    // because the input validates the typed string one character at a time. Deriving these from
    // the formatter covers multi-character and locale-specific symbols of every part type
    // uniformly. `compact` suffixes (e.g. `K`/`M`) are excluded because `parseNumber` can't reverse
    // them, so allowing them would yield a silently incorrect value.
    parts.forEach((part) => {
      if (
        part.type === 'integer' ||
        part.type === 'fraction' ||
        part.type === 'exponentInteger' ||
        part.type === 'compact'
      ) {
        return;
      }
      addAll(Array.from(part.value));
      if (SPACE_SEPARATOR_RE.test(part.value)) {
        keys.add(' ');
      }
    });

    const allowPercentSymbols =
      formatStyle === 'percent' || (formatStyle === 'unit' && format?.unit === 'percent');
    const allowPermilleSymbols =
      formatStyle === 'percent' || (formatStyle === 'unit' && format?.unit === 'permille');

    // Tolerate percent/permille variants the formatter doesn't emit but users may type or paste.
    if (allowPercentSymbols) {
      addAll(PERCENTAGES);
    }
    if (allowPermilleSymbols) {
      addAll(PERMILLE);
    }

    // Allow plus sign in all cases; minus sign when negatives are valid, or when out-of-range
    // entry is allowed so native underflow validation can be triggered from the keyboard.
    addAll(PLUS_SIGNS_WITH_ASCII);
    if (minWithDefault < 0 || allowOutOfRange) {
      addAll(MINUS_SIGNS_WITH_ASCII);
    }

    return keys;
  };

  const getStepAmount = (event?: EventWithOptionalKeyState) => {
    if (event?.altKey) {
      return smallStep;
    }
    if (event?.shiftKey) {
      return largeStep;
    }
    return step;
  };

  const setValue = (
    unvalidatedValue: number | null,
    details: NumberFieldRootChangeEventDetails,
  ): boolean => {
    const eventWithOptionalKeyState = details.event as EventWithOptionalKeyState;
    const dir = details.direction;

    // Direct text entry (typing, pasting, clearing, autofill) behaves natively; step-based
    // interactions (keyboard arrows, buttons, wheel, scrub) do not. All direct-entry reasons
    // (`input-change`, `input-clear`, `input-blur`, `input-paste`) share the `input-` prefix.
    const isInputReason = details.reason.startsWith('input-') || details.reason === REASONS.none;

    // Only allow out-of-range values for direct text entry. Step-based interactions still clamp.
    const shouldClampValue = !allowOutOfRange || !isInputReason;

    const validatedValue = toValidatedNumber(
      unvalidatedValue,
      dir ? getStepAmount(eventWithOptionalKeyState) * dir : undefined,
      minWithDefault,
      maxWithDefault,
      minWithZeroDefault,
      formatOptionsRef.current,
      snapOnStep,
      eventWithOptionalKeyState?.altKey ?? false,
      shouldClampValue,
    );

    // Notify about a change even when the numeric value is unchanged for input reasons: the
    // typed text may clamp/snap to the current value, or differ while validation normalizes
    // it back to the existing value.
    const shouldFireChange =
      validatedValue !== value ||
      (isInputReason && (unvalidatedValue !== value || allowInputSyncRef.current === false));

    if (shouldFireChange) {
      onValueChangeProp?.(validatedValue, details);

      if (details.isCanceled) {
        // Report a vetoed change as not applied, so callers don't commit a value never stored.
        return false;
      }

      valueState.set(validatedValue);
      setDirty(validatedValue !== validityData.initialValue);
      hasPendingCommitRef.current = true;
    }

    lastChangedValueRef.current = validatedValue;

    // Keep the visible input in sync immediately when programmatic changes occur
    // (increment/decrement, wheel, etc). During direct typing we don't want
    // to overwrite the user-provided text until blur, so we gate on
    // `allowInputSyncRef`.
    if (allowInputSyncRef.current) {
      setInputValue(formatNumber(validatedValue, locale, format));
    }

    return shouldFireChange;
  };

  const incrementValue = (
    amount: number,
    { direction, currentValue, event, reason }: IncrementValueParameters,
  ) => {
    const prevValue = currentValue == null ? valueRef.current : currentValue;
    const nativeEvent = event as ReasonToEvent<IncrementValueParameters['reason']> | undefined;

    if (typeof prevValue !== 'number') {
      // Seed an empty field with 0; `setValue` clamps it to the in-range value nearest 0
      // (e.g. `max` for a negative range). No `direction`: the seed isn't a step, so it must
      // not be directionally snapped.
      return setValue(0, createChangeEventDetails(reason, nativeEvent));
    }

    return setValue(
      prevValue + amount * direction,
      createChangeEventDetails(reason, nativeEvent, undefined, {
        direction,
      }),
    );
  };

  // Formatting synchronizes an external value/locale/format and accepted step changes.
  // Direct typing retains authority until blur, exactly as the source ref gate requires.
  $effect(() => {
    const nextInputValue = formatNumber(value, locale, format);
    // Numeric/text/format changes synchronize formatting; the source gate is imperative.
    void inputValue;
    const shouldSync = allowInputSyncRef.current;
    untrack(() => {
      if (shouldSync && nextInputValue !== inputValue) setInputValue(nextInputValue);
    });
  });
  $effect(() => {
    const minimum = minWithDefault;
    if (platform.os.ios) inputMode = minimum >= 0 ? 'decimal' : 'text';
  });
  const focusInput = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const length = input.value.length;
    input.setSelectionRange(length, length);
    input.focus();
  };

  $effect(() => {
    const element = inputRef.current;
    if (disabled || readOnly || !allowWheelScrub || !element) return;
    function handleWheel(event: WheelEvent) {
      if (
        // Allow pinch-zooming.
        event.ctrlKey ||
        activeElement(ownerDocument(inputRef.current)) !== inputRef.current
      ) {
        return;
      }

      // Some browsers deliver shift + wheel on the horizontal axis, so there the horizontal
      // delta is the intended vertical one. Touchpads emit sub-pixel noise on the cross axis,
      // so compare the axes rather than requiring an exact zero.
      const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = event.shiftKey && isHorizontal ? event.deltaX : event.deltaY;

      // Ignore horizontal gestures so the page can scroll instead of scrubbing. Shift is exempt:
      // its gesture is horizontal wherever the browser swaps the axis.
      if (delta === 0 || (!event.shiftKey && isHorizontal)) {
        return;
      }

      // Prevent the default behavior to avoid scrolling the page.
      event.preventDefault();
      allowInputSyncRef.current = true;

      const amount = getStepAmount(event);

      // Each wheel turn is a discrete, final change, so commit it immediately like keyboard
      // steps (gated on an actual change so boundary no-ops don't commit).
      const changed = incrementValue(amount, {
        direction: delta > 0 ? -1 : 1,
        event,
        reason: REASONS.wheel,
      });
      if (changed) {
        onValueCommitted(
          lastChangedValueRef.current,
          createGenericEventDetails(REASONS.wheel, event),
        );
      }
    }

    return addEventListener(element, 'wheel', handleWheel, { passive: false });
  });
  const rootState: NumberFieldRootState = $derived({
    ...field.state,
    disabled,
    readOnly,
    required,
    value,
    inputValue,
    scrubbing: isScrubbing,
  });
  setNumberFieldRootContext({
    inputRef,
    focusInput,
    get minWithDefault() {
      return minWithDefault;
    },
    get maxWithDefault() {
      return maxWithDefault;
    },
    get id() {
      return id;
    },
    setValue,
    incrementValue,
    getStepAmount,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    lastChangedValueRef,
    hasPendingCommitRef,
    get name() {
      return name;
    },
    get nameProp() {
      return nameProp;
    },
    get inputMode() {
      return inputMode;
    },
    getAllowedNonNumericKeys,
    get min() {
      return min;
    },
    get max() {
      return max;
    },
    setInputValue,
    get locale() {
      return locale;
    },
    setIsScrubbing(next) {
      isScrubbing = next;
    },
    get state() {
      return rootState;
    },
    onValueCommitted,
  });
  function attachHiddenInput(host: HTMLInputElement) {
    const currentValidation = validation;
    const controlRef = inputRef;
    return untrack(() => {
      inputRefProp = host;
      currentValidation.inputRef.current = host;
      const unregister = currentValidation.registerInput(host, { controlRef, value: undefined });
      return () =>
        untrack(() => {
          unregister?.();
          if (inputRefProp === host) inputRefProp = null;
          if (currentValidation.inputRef.current === host)
            currentValidation.inputRef.current = null;
        });
    });
  }
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      rootState,
      { class: classProp, style },
      elementProps,
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
  const hiddenProps = $derived(
    validation.getValidationProps(disabled, {
      onfocus() {
        focusInput();
      },
      oninput(event: Event) {
        if (event.defaultPrevented || disabled || readOnly) return;
        const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;
        const parsedValue = Number.isNaN(nextValue) ? null : nextValue;
        const details = createChangeEventDetails(REASONS.none, event);
        setValue(parsedValue, details);
        clearErrors(name);
        validation.change(lastChangedValueRef.current ?? parsedValue);
      },
    }),
  );
</script>

{#if render}
  {@render render(mergedProps, rootState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
<input
  {...hiddenProps as HTMLInputAttributes}
  {@attach attachHiddenInput}
  type="number"
  {form}
  name={nativeName}
  value={value ?? ''}
  {min}
  {max}
  step={stepProp}
  {disabled}
  readonly={readOnly}
  {required}
  aria-hidden="true"
  tabindex="-1"
  style={toNativeStyle(name ? visuallyHiddenInput : visuallyHidden)}
/>
