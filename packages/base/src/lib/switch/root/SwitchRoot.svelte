<script lang="ts">
  import { untrack } from 'svelte';
  // Source-ordered business port of Base UI v1.8.0 SwitchRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { useFieldControlNativeName } from '../../internals/field-control-name/FieldControlNameContext.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { MergedRefs } from '@sveltery/utils/useMergedRefs';
  import { createRefAttachment } from '../../internals/nativeRefAttachment.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { Controlled } from '@sveltery/utils/Controlled';

  import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import { useButton } from '../../internals/use-button/useButton.svelte.js';
  import { setSwitchRootContext } from './SwitchRootContext.js';
  import { stateAttributesMapping } from '../stateAttributesMapping.js';
  import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext.js';
  import { useAriaLabelledBy } from '../../internals/labelable-provider/useAriaLabelledBy.svelte.js';
  import { useLabelableId } from '../../internals/labelable-provider/useLabelableId.svelte.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { ValueChanged } from '../../internals/ValueChanged.svelte.js';
  import type { SwitchRootProps, SwitchRootState } from '../types.js';
  let {
    checked: checkedProp,
    class: classProp,
    defaultChecked,
    'aria-labelledby': ariaLabelledByProp,
    form,
    id: idProp,
    inputRef: externalInputRef,
    name: nameProp,
    nativeButton = false,
    onCheckedChange,
    readOnly = false,
    required = false,
    disabled: disabledProp = false,
    render,
    uncheckedValue,
    value,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SwitchRootProps = $props();
  const formContext = useFormContext();
  const field = useFieldRootContext();
  const labelable = useLabelableContext();
  const disabled = $derived(Boolean(field.disabled || disabledProp));
  const name = $derived(field.name ?? nameProp);
  const getNativeName = useFieldControlNativeName();
  const nativeName = $derived(getNativeName(name));
  const inputRef = $state<{ current: HTMLInputElement | null }>({ current: null });
  const switchRef = $state<{ current: HTMLElement | null }>({ current: null });
  const instanceId = $props.id();
  const id = useBaseUiId(undefined, instanceId);
  const getControlId = useLabelableId(() => ({ id: idProp }), `${id}-input`);
  const controlId = $derived(getControlId());
  const hiddenInputId = $derived(nativeButton ? undefined : controlId);
  const checkedState = new Controlled(
    () => checkedProp,
    untrack(() => Boolean(defaultChecked)),
  );
  const checked = $derived(checkedState.value);
  useRegisterFieldControl(
    switchRef,
    () => id,
    () => checked,
    undefined,
    () => !disabled,
    () => nameProp,
  );
  $effect(() => field.setFilled(checked));
  new ValueChanged(
    () => checked,
    () => () => {
      formContext.clearErrors(name);
      field.setDirty(checked !== field.validityData.initialValue);
      field.validation.change(checked);
    },
  );
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const getAriaLabelledBy = useAriaLabelledBy(() => ({
    explicitAriaLabelledBy: ariaLabelledByProp ?? undefined,
    labelId: labelable.labelId,
    labelSource: inputRef.current,
    enableFallback: !nativeButton,
    generatedLabelId: `${controlId}-label`,
  }));
  const rootProps = $derived({
    id: nativeButton ? controlId : id,
    role: 'switch',
    'aria-checked': checked,
    'aria-readonly': readOnly || undefined,
    'aria-required': required || undefined,
    'aria-labelledby': getAriaLabelledBy(),
    onfocus() {
      if (!disabled) field.setFocused(true);
    },
    onblur() {
      const element = inputRef.current;
      if (!element || disabled) return;
      field.setTouched(true);
      field.setFocused(false);
      if (field.validationMode === 'onBlur') void field.validation.commit(element.checked);
    },
    onclick(event: MouseEvent) {
      if (readOnly || disabled) return;
      event.preventDefault();
      const input = inputRef.current;
      if (input) dispatchClickWithModifiers(input, event);
    },
  });
  const inputProps = $derived({
    ...field.validation.getValidationProps(disabled),
    defaultChecked,
    disabled,
    form,
    id: hiddenInputId,
    name: nativeName,
    required,
    style: toNativeStyle(name ? visuallyHiddenInput : visuallyHidden),
    tabindex: -1,
    type: 'checkbox',
    'aria-hidden': true,
    onclick(event: MouseEvent) {
      // The hidden input's activation is a single native click. Cancellation
      // uses the browser's checkbox rollback before input/change reach Kit.
      event.stopPropagation();
      if (event.defaultPrevented) return;
      if (readOnly) {
        event.preventDefault();
        return;
      }
      const nextChecked = (event.currentTarget as HTMLInputElement).checked;
      const details = createChangeEventDetails(REASONS.none, event);
      onCheckedChange?.(nextChecked, details);
      if (details.isCanceled) {
        event.preventDefault();
        return;
      }
      checkedState.set(nextChecked);
    },
    onfocus() {
      switchRef.current?.focus();
    },
    ...(value !== undefined ? { value } : {}),
  });
  const rootState: SwitchRootState = $derived({
    ...field.state,
    checked,
    disabled,
    readOnly,
    required,
  });
  setSwitchRootContext(() => rootState);
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(element: HTMLElement | null) {
      ref = element;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state: rootState,
    ref: [forwardedRef, switchRef, buttonRef],
    props: [
      rootProps,
      elementProps,
      getButtonProps,
      (props: Record<string, unknown>) => field.validation.getValidationProps(disabled, props),
    ],
    stateAttributesMapping,
  });
  const refsMerger = new MergedRefs<HTMLInputElement>();
  const resolveInputAttachment = createRefAttachment<HTMLInputElement>(() => {});
  const inputAttachment = $derived(
    resolveInputAttachment(refsMerger.merge(inputRef, externalInputRef, field.validation.inputRef)),
  );
</script>

<RenderElement tag="span" {componentProps} {params} {children} />
{#if !checked && name && uncheckedValue !== undefined}
  <input type="hidden" {form} name={nativeName} value={uncheckedValue} {disabled} />
{/if}
<!-- Native binding owns checkbox DOM/default/hydration and form-reset behavior. -->
<input
  {...inputProps as HTMLInputAttributes}
  type="checkbox"
  {@attach inputAttachment}
  bind:checked={() => checkedState.value, (next) => checkedState.set(next)}
/>
