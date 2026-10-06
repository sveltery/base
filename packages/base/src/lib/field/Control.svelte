<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  import { onDestroy, untrack } from 'svelte';
  // Ported in source order from Base UI v1.8.0 field/control/FieldControl.tsx.
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { Controlled } from '@sveltery/utils/Controlled';

  import { ownerDocument } from '@sveltery/utils/owner';

  import { Timeout } from '@sveltery/utils/useTimeout';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useFieldControlNativeName } from '../internals/field-control-name/FieldControlNameContext.js';
  import { useRegisterFieldControl } from '../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFormContext } from '../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { useLabelableId } from '../internals/labelable-provider/useLabelableId.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { ValueChanged } from '../internals/ValueChanged.svelte.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { activeElement } from '@sveltery/utils/shadowDom';
  import type { FieldControlProps, FieldControlState } from './types.js';
  let {
    render,
    class: classProp,
    id: idProp,
    name: nameProp,
    value: valueProp,
    disabled: disabledProp = false,
    onValueChange,
    defaultValue,
    autofocus = false,
    style,
    ref = $bindable(),
    ...elementProps
  }: FieldControlProps = $props();
  const field = useFieldRootContext();
  const form = useFormContext();
  const disabled = $derived(Boolean(field.disabled || disabledProp));
  const name = $derived(field.name ?? nameProp);
  const getNativeName = useFieldControlNativeName();
  const controlState: FieldControlState = $derived({
    ...field.state,
    disabled,
  });
  const labelable = useLabelableContext();
  const instanceId = $props.id();
  const getId = useLabelableId(() => ({ id: idProp }), useBaseUiId(undefined, instanceId));
  const id = $derived(getId());
  const valueState = new Controlled(
    () => valueProp,
    untrack(() => defaultValue),
  );
  const isControlled = $derived(valueProp !== undefined);
  const value = $derived(isControlled ? valueState.value : undefined);
  const serializedValue = $derived(value == null ? undefined : String(value));
  const getValueFromInput = () => field.validation.inputRef.current?.value;
  useRegisterFieldControl(
    field.validation.inputRef,
    () => id,
    () => serializedValue,
    getValueFromInput,
    () => !disabled,
    () => nameProp ?? undefined,
  );
  $effect(() => {
    const currentValue = serializedValue ?? field.validation.inputRef.current?.value;
    if (currentValue !== undefined) field.setFilled(currentValue !== '');
  });
  new ValueChanged(
    () => serializedValue,
    () => () => {
      if (serializedValue === undefined) return;
      form.clearErrors(name ?? undefined);
      field.setDirty(serializedValue !== (field.validityData.initialValue ?? ''));
      field.validation.change(serializedValue);
    },
  );
  const inputRef = $state<{ current: HTMLElement | null }>({ current: null });
  const enterValidationTimeout = new Timeout();
  onDestroy(enterValidationTimeout.clear);
  $effect(() => {
    if (autofocus && inputRef.current === activeElement(ownerDocument(inputRef.current)))
      field.setFocused(true);
  });
  const internal = $derived({
    id,
    disabled,
    name: getNativeName(name),
    'aria-labelledby': labelable.labelId,
    autofocus,
    // Native Svelte keeps an authored reset default independent from the current value (I-02).
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(isControlled ? { value } : {}),
    oninput(event: Event) {
      const inputValue = (event.currentTarget as HTMLInputElement).value;
      const details = createChangeEventDetails(REASONS.none, event);
      onValueChange?.(inputValue, details);
      if (isControlled) return;
      field.setDirty(inputValue !== (field.validityData.initialValue ?? ''));
      field.setFilled(inputValue !== '');
      if (!event.defaultPrevented && !details.isCanceled) {
        form.clearErrors(name ?? undefined);
        field.validation.change(inputValue);
      }
    },
    onfocus() {
      field.setFocused(true);
    },
    onblur(event: FocusEvent) {
      field.setTouched(true);
      field.setFocused(false);
      if (field.validationMode === 'onBlur') {
        const inputValue = (event.currentTarget as HTMLInputElement).value;
        void field.validation.commit(inputValue);
        if (isControlled)
          queueMicrotask(() => {
            const nextValue = field.validation.inputRef.current?.value;
            if (
              nextValue !== undefined &&
              nextValue !== inputValue &&
              nextValue !== (field.validityData.initialValue ?? '')
            )
              void field.validation.commit(nextValue);
          });
      }
    },
    onkeydown(event: KeyboardEvent) {
      const input = event.currentTarget as HTMLInputElement;
      if (input.tagName === 'INPUT' && event.key === 'Enter') {
        field.setTouched(true);
        const value = input.value;
        const formElement = input.form;
        if (formElement && formElement === form.elementRef.current && !event.defaultPrevented) {
          const submitCount = form.submitCountRef.current;
          enterValidationTimeout.start(0, () => {
            if (form.submitCountRef.current === submitCount)
              void field.validation.commit(input.value);
          });
        } else void field.validation.commit(value);
      }
    },
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      field.validation.inputRef.current = host as HTMLInputElement;
      ref = host;
      inputRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (inputRef.current === host) inputRef.current = null;
          if (field.validation.inputRef.current === host) field.validation.inputRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      controlState,
      { class: classProp, style: style },
      [
        internal,
        elementProps,
        (props: Record<string, unknown>) => field.validation.getValidationProps(disabled, props),
      ],
      fieldValidityMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, controlState, undefined)}
{:else}
  <input {...mergedProps} />
{/if}
