<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  import { onDestroy, untrack } from 'svelte';
  // Narrow native-host boundary. Source Field registration, validation, labels
  // and callback/dirty ordering are reused; native hosts own selection and reset.
  // FieldControl business branches: Base UI 1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useFieldItemContext } from '../field/item/FieldItemContext.js';
  import { useFormContext } from '../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { LabelableIdOwner } from '../internals/labelable-provider/useLabelableId.svelte.js';
  import { useRegisterFieldControl } from '../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFieldControlNativeName } from '../internals/field-control-name/FieldControlNameContext.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';

  import { Timeout } from '@sveltery/utils/useTimeout';
  import { ownerDocument } from '@sveltery/utils/owner';
  import { activeElement } from '@sveltery/utils/shadowDom';

  import { ValueChanged } from '../internals/ValueChanged.svelte.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { areArraysEqual } from '@sveltery/utils/areArraysEqual';
  import { useRemoteFieldContext } from './RemoteFieldContext.js';
  import { nativeControlValue } from './nativeControlValue.js';
  import type { NativeValidationControl } from '../field/root/useFieldValidation.svelte.js';
  import type { RemoteControlProps, RemoteControlState } from './control.types.js';
  let {
    kind,
    ref = $bindable(),
    render,
    onValueChange,
    onCheckedChange,
    children,
    ...props
  }: RemoteControlProps & { kind: string } = $props();
  const remote = useRemoteFieldContext();
  const field = useFieldRootContext();
  const item = useFieldItemContext();
  const form = useFormContext();
  const labelable = useLabelableContext();
  const descriptor = $derived({ ...remote?.descriptor, ...props });
  const disabled = $derived(
    Boolean(
      field.disabled ||
      descriptor.disabled ||
      (['radio', 'checkbox'].includes(kind) && item.disabled),
    ),
  );
  const name = $derived(field.name ?? descriptor.name);
  const getNativeName = useFieldControlNativeName();
  const instanceId = $props.id();
  const labelableId = new LabelableIdOwner(
    () => ({ id: descriptor.id }),
    useBaseUiId(undefined, instanceId),
  );
  const id = $derived(labelableId.getId());
  const controlRef = $state<{ current: NativeValidationControl | null }>({
    current: null,
  });
  const ownerValue = $derived(remote?.accessor?.value());
  const getValue = () =>
    ownerValue ??
    (controlRef.current
      ? nativeControlValue(controlRef.current, descriptor.value)
      : descriptor.value);
  const sameValue = (left: unknown, right: unknown) =>
    Array.isArray(left) && Array.isArray(right) ? areArraysEqual(left, right) : left === right;
  const filled = (value: unknown) =>
    Array.isArray(value) ? value.length > 0 : value != null && value !== '';
  useRegisterFieldControl(
    controlRef,
    () => id,
    () => ownerValue,
    getValue,
    () => !disabled,
    () => descriptor.name,
  );
  $effect(() => {
    const element = controlRef.current;
    if (!element || disabled) return;
    return field.validation.registerInput(element, {
      controlRef,
      value: undefined,
    });
  });
  $effect(() => field.setFilled(filled(getValue())));
  new ValueChanged(
    () => ownerValue,
    () => () => {
      form.clearErrors(name);
      field.setDirty(!sameValue(ownerValue, field.validityData.initialValue));
      field.validation.change(ownerValue);
    },
  );
  const enterValidationTimeout = new Timeout();
  onDestroy(enterValidationTimeout.clear);
  $effect(() => {
    if (
      descriptor.autofocus &&
      controlRef.current === activeElement(ownerDocument(controlRef.current))
    )
      field.setFocused(true);
  });
  const controlState: RemoteControlState = $derived({
    ...field.state,
    disabled,
    checked: typeof descriptor.checked === 'boolean' ? descriptor.checked : undefined,
  });
  const internal = $derived({
    id,
    disabled,
    name: getNativeName(name),
    'aria-labelledby': labelable.labelId,
    oninput(event: Event) {
      const control = controlRef.current;
      if (!control) return;
      const value = nativeControlValue(control, descriptor.value);
      const details = createChangeEventDetails(REASONS.none, event);
      // Option activation has a cancelable click phase; other native hosts
      // retain their normal input callback and validation phase.
      if (!('checked' in control) || !['radio', 'checkbox'].includes(control.type))
        onValueChange?.(value, details);
      if (remote?.accessor) return;
      field.setDirty(!sameValue(value, field.validityData.initialValue));
      field.setFilled(filled(value));
      if (!event.defaultPrevented && !details.isCanceled) {
        form.clearErrors(name);
        field.validation.change(value);
      }
    },
    onclick(event: MouseEvent) {
      const control = controlRef.current;
      if (!control || !('checked' in control)) return;
      if (event.defaultPrevented || disabled) return;
      if (descriptor.readOnly || descriptor.readonly) {
        event.preventDefault();
        return;
      }
      if (control.type === 'radio' && descriptor.checked) return;
      const details = createChangeEventDetails(REASONS.none, event);
      onCheckedChange?.(control.checked, details);
      if (!details.isCanceled)
        onValueChange?.(nativeControlValue(control, descriptor.value), details);
      if (details.isCanceled) event.preventDefault();
    },
    onfocus() {
      field.setFocused(true);
    },
    onblur() {
      field.setTouched(true);
      field.setFocused(false);
      if (field.validationMode === 'onBlur') void field.validation.commit(getValue());
    },
    onkeydown(event: KeyboardEvent) {
      const control = controlRef.current;
      if (!control || control.tagName !== 'INPUT' || event.key !== 'Enter') return;
      field.setTouched(true);
      const formElement = control.form;
      if (formElement && formElement === form.elementRef.current && !event.defaultPrevented) {
        const submitCount = form.submitCountRef.current;
        enterValidationTimeout.start(0, () => {
          if (form.submitCountRef.current === submitCount) void field.validation.commit(getValue());
        });
      } else void field.validation.commit(getValue());
    },
  });

  const nativeProps = $derived.by(() => {
    const {
      class: _class,
      style: _style,
      id: _id,
      disabled: _disabled,
      inputRef: _inputRef,
      nativeButton: _nativeButton,
      uncheckedValue: _uncheckedValue,
      ...attributes
    } = descriptor;
    void [_class, _style, _id, _disabled, _inputRef, _nativeButton, _uncheckedValue];
    return attributes;
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: NativeValidationControl) {
    return untrack(() => {
      ref = host;
      controlRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (controlRef.current === host) controlRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      controlState,
      { class: descriptor.class, style: descriptor.style },
      [
        internal,
        nativeProps,
        (merged: Record<string, unknown>) => field.validation.getValidationProps(disabled, merged),
      ],
      fieldValidityMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, controlState, children)}
{:else}
  {#if kind.startsWith('select')}<select {...mergedProps}>{@render children?.()}</select
    >{:else}<input {...mergedProps} />{/if}
{/if}
