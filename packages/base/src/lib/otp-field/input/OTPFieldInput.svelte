<script lang="ts">
  // Source-ordered port of Base UI v1.8.0 OTPFieldInput.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { DEV } from "esm-env";
  import { createLogOnce } from "../../utils/createLogOnce.js";
  import { stopEvent } from "../../floating-ui/utils/event.js";
  import { useCompositeListItem } from "../../internals/composite/list/useCompositeListItem.svelte.js";
  import { useDirection } from "../../direction-provider/context.js";
  import RenderElement from "../../internals/RenderElement.svelte";
  import {
    createChangeEventDetails,
    createGenericEventDetails,
  } from "../../internals/createBaseUIEventDetails.js";
  import { REASONS } from "../../internals/reasons.js";
  import {
    useOTPFieldRootContext,
    getOTPFieldInputState,
  } from "../root/OTPFieldRootContext.js";
  import { inputStateAttributesMapping } from "../utils/stateAttributesMapping.js";
  import {
    normalizeOTPValueWithDetails,
    removeOTPCharacter,
    replaceOTPValue,
  } from "../utils/otp.js";
  import type { OTPFieldInputProps } from "../types.js";
  let {
    "aria-label": externalAriaLabel,
    "aria-labelledby": externalAriaLabelledBy,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: OTPFieldInputProps = $props();
  const context = useOTPFieldRootContext();
  const activeIndex = $derived(context.activeIndex);
  const autoComplete = $derived(context.autoComplete);
  const disabled = $derived(context.disabled);
  const form = $derived(context.form);
  const inputMode = $derived(context.inputMode);
  const inputAriaLabelledBy = $derived(context.inputAriaLabelledBy);
  const invalid = $derived(context.invalid);
  const length = $derived(context.length);
  const mask = $derived(context.mask);
  const pattern = $derived(context.pattern);
  const readOnly = $derived(context.readOnly);
  const required = $derived(context.required);
  const normalizeValue = $derived(context.normalizeValue);
  const rootState = $derived(context.state);
  const validationType = $derived(context.validationType);
  const value = $derived(context.value);
  const {
    focusInput,
    queueFocusInput,
    getInputId,
    handleInputBlur,
    handleInputFocus,
    reportValueInvalid,
    setValue,
  } = context;
  const listItem = useCompositeListItem(() => ({ guess: true }));
  const index = $derived(listItem.index());
  const inputRef = $state<{ current: HTMLElement | null }>({ current: null });
  const direction = useDirection();
  const slotValue = $derived(value[index] ?? "");
  const inputState = $derived(getOTPFieldInputState(rootState, slotValue, index));
  const slotAriaLabel = $derived(externalAriaLabel);
  const inheritedLabel = $derived(externalAriaLabelledBy ?? inputAriaLabelledBy);
  const ariaLabel = $derived(index === 0 ? undefined : slotAriaLabel);
  const warn = createLogOnce("warn", "Base UI");
  if (DEV) {
    $effect(() => {
      if (
        index !== 0 ||
        slotAriaLabel == null ||
        (inputRef.current as HTMLInputElement | null)?.labels?.length
      )
        return;
      warn(
        "<OTPField.Input> ignores `aria-label` on the first input. Use a `<label>` or `<Field.Label>` to label the OTP field.",
      );
    });
  }
  const inputProps = $derived({
    id: getInputId(index),
    value: slotValue,
    type: mask ? "password" : "text",
    inputmode: inputMode,
    autocomplete: index === 0 ? autoComplete : "off",
    autocorrect: "off",
    spellcheck: "false",
    enterkeyhint: index === length - 1 ? "done" : "next",
    // Only the first slot has a max length to avoid password manager bubbles appearing after later inputs.
    maxlength: index === 0 ? length : undefined,
    tabindex: activeIndex === index ? 0 : -1,
    disabled,
    form,
    pattern,
    readonly: readOnly,
    required,
    "aria-labelledby": ariaLabel == null ? inheritedLabel : undefined,
    "aria-invalid": !disabled && invalid ? true : undefined,
    "aria-label": ariaLabel,
    onmousedown(event: MouseEvent) {
      if (event.defaultPrevented || disabled) {
        return;
      }

      event.preventDefault();
      focusInput(index);
    },
    onfocus(event: FocusEvent) {
      if (event.defaultPrevented || disabled) {
        return;
      }

      handleInputFocus(index, event);
    },
    onblur(event: FocusEvent) {
      if (event.defaultPrevented) {
        return;
      }

      handleInputBlur(event);
    },
    oninput(event: Event) {
      if (event.defaultPrevented || disabled || readOnly) {
        return;
      }

      const rawValue = (event.currentTarget as HTMLInputElement).value;
      const [nextDigits, didRejectCharacters] = normalizeOTPValueWithDetails(
        rawValue,
        length,
        validationType,
        normalizeValue,
      );

      if (didRejectCharacters) {
        reportValueInvalid(
          rawValue,
          createGenericEventDetails(REASONS.inputChange, event),
        );
      }

      if (nextDigits === "") {
        if (rawValue === "") {
          setValue(
            removeOTPCharacter(value, index),
            createChangeEventDetails(REASONS.inputClear, event),
          );
        } else if (slotValue !== "") {
          (event.currentTarget as HTMLInputElement).value = slotValue;
          (event.currentTarget as HTMLInputElement).select();
        }
        return;
      }

      const nextValue = replaceOTPValue(
        value,
        index,
        nextDigits,
        length,
        validationType,
        normalizeValue,
      );

      const committedValue = setValue(
        nextValue,
        createChangeEventDetails(REASONS.inputChange, event),
      );

      if (committedValue != null) {
        const nextInput = Math.min(index + nextDigits.length, length - 1);
        queueFocusInput(nextInput, committedValue);
      }
    },
    onkeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || disabled) {
        return;
      }

      const firstIndex = 0;
      const lastIndex = Math.max(length - 1, firstIndex);
      const endTargetIndex = Math.min(value.length, lastIndex);
      const hasBoundaryModifier =
        (event.ctrlKey || event.metaKey) && !event.altKey;
      const isRtl = direction() === "rtl";
      const previousKey = isRtl ? "ArrowRight" : "ArrowLeft";
      const nextKey = isRtl ? "ArrowLeft" : "ArrowRight";

      if (event.key === previousKey) {
        stopEvent(event);
        focusInput(
          hasBoundaryModifier ? firstIndex : Math.max(firstIndex, index - 1),
        );
        return;
      }

      if (event.key === nextKey) {
        stopEvent(event);
        focusInput(
          hasBoundaryModifier ? endTargetIndex : Math.min(lastIndex, index + 1),
        );
        return;
      }

      if (event.key === "Home" || event.key === "ArrowUp") {
        stopEvent(event);
        focusInput(firstIndex);
        return;
      }

      if (event.key === "End" || event.key === "ArrowDown") {
        stopEvent(event);
        focusInput(endTargetIndex);
        return;
      }

      if (readOnly) {
        return;
      }

      function setKeyboardValue(nextValue: string, targetIndex: number) {
        const committedValue = setValue(
          nextValue,
          createChangeEventDetails(REASONS.keyboard, event),
        );

        if (committedValue != null) {
          queueFocusInput(targetIndex, committedValue);
        }
      }

      if (event.key === "Backspace" && hasBoundaryModifier) {
        stopEvent(event);
        setKeyboardValue("", firstIndex);
        return;
      }

      if (event.key === "Delete") {
        stopEvent(event);
        setKeyboardValue(removeOTPCharacter(value, index), index);
        return;
      }

      const inputValue = (event.currentTarget as HTMLInputElement).value;
      const fullSelection =
        (event.currentTarget as HTMLInputElement).selectionStart === 0 &&
        (event.currentTarget as HTMLInputElement).selectionEnd ===
          inputValue.length;

      if (event.key.length === 1 && fullSelection && slotValue === event.key) {
        stopEvent(event);
        if (index < length - 1) {
          focusInput(index + 1);
        }
        return;
      }

      if (event.key === "Backspace") {
        stopEvent(event);
        const targetIndex = Math.max(firstIndex, index - 1);
        const deleteIndex = slotValue === "" ? targetIndex : index;
        setKeyboardValue(removeOTPCharacter(value, deleteIndex), targetIndex);
      }
    },
    onpaste(event: ClipboardEvent) {
      if (event.defaultPrevented || disabled || readOnly) {
        return;
      }

      let rawValue: string;

      try {
        rawValue = event.clipboardData?.getData("text/plain") ?? "";
      } catch {
        /* istanbul ignore else -- `process.env.NODE_ENV` is a build-time constant under test */
        if (DEV) {
          warn(
            "<OTPField.Input> could not read clipboard text during paste handling.",
          );
        }

        return;
      }

      event.preventDefault();

      const [nextDigits, didRejectCharacters] = normalizeOTPValueWithDetails(
        rawValue,
        length,
        validationType,
        normalizeValue,
      );

      if (didRejectCharacters) {
        reportValueInvalid(
          rawValue,
          createGenericEventDetails(REASONS.inputPaste, event),
        );
      }

      if (nextDigits === "") {
        return;
      }

      const committedValue = setValue(
        replaceOTPValue(
          value,
          index,
          nextDigits,
          length,
          validationType,
          normalizeValue,
        ),
        createChangeEventDetails(REASONS.inputPaste, event),
      );

      if (committedValue != null) {
        const nextInput = Math.min(index + nextDigits.length, length - 1);
        queueFocusInput(nextInput, committedValue);
      }
    },
  });
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    ref: [forwardedRef, listItem.ref, inputRef],
    state: inputState,
    props: [inputProps, elementProps],
    stateAttributesMapping: inputStateAttributesMapping,
  });
</script>
<RenderElement tag="input" {componentProps} {params} />
