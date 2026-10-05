<script lang="ts" generics="Value">
import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Source-ordered port of Base UI v1.8.0 RadioRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import CompositeItem from '../../internals/composite/item/CompositeItem.svelte';

  import {
    visuallyHidden,
    visuallyHiddenInput,
  } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { stateAttributesMapping } from '../stateAttributesMapping.js';
  import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import { useButton } from '../../internals/use-button/useButton.svelte.js';
  import { ACTIVE_COMPOSITE_ITEM } from '../../internals/composite/constants.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useFieldItemContext } from '../../field/item/FieldItemContext.js';
  import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext.js';
  import { useAriaLabelledBy } from '../../internals/labelable-provider/useAriaLabelledBy.svelte.js';
  import { useLabelableId } from '../../internals/labelable-provider/useLabelableId.svelte.js';
  import { useRadioGroupContext } from '../../radio-group/RadioGroupContext.js';
  import { useFieldControlNativeName } from '../../internals/field-control-name/FieldControlNameContext.js';
  import { serializeValue } from '../../internals/serializeValue.js';
  import { setRadioRootContext } from './RadioRootContext.js';
  import type { RadioRootProps, RadioRootState } from '../types.js';
  import type { HTMLProps } from '../../internals/types.js';
  let {
    render,
    class: classProp,
    disabled: disabledProp = false,
    readOnly: readOnlyProp = false,
    required: requiredProp = false,
    'aria-labelledby': ariaLabelledByProp,
    value,
    inputRef: inputRefProp = $bindable(),
    nativeButton = false,
    id: idProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: RadioRootProps<Value> = $props();
  const group = useRadioGroupContext<Value>();
  const nativeName = useFieldControlNativeName();
  const field = useFieldRootContext();
  const item = useFieldItemContext();
  const labelable = useLabelableContext();
  const disabled = $derived(
    Boolean(field.disabled || item.disabled || group?.disabled || disabledProp),
  );
  const readOnly = $derived(Boolean(group?.readOnly || readOnlyProp));
  const required = $derived(Boolean(group?.required || requiredProp));
  const checked = $derived(group ? group.checkedValue === value : value === '');
  const radioRef = $state<{ current: HTMLElement | null }>({ current: null });
  const inputRef = $state<{ current: HTMLInputElement | null }>({
    current: null,
  });
  const registerInput = (input: HTMLInputElement | null) => {
    if (!input) return;
    return group?.validation?.registerInput(input, {
      controlRef: radioRef,
      value: undefined,
    });
  };
  $effect(() => {
      if (inputRef.current?.checked) field.setFilled(true);
    });
  $effect(() => {
      if (!inputRef.current) return;
      if (disabled && checked) {
        group?.registerInputRef(null);
        return;
      }
      group?.registerInputRef(inputRef.current);
    });
  const nativeId = $props.id();
  const id = useBaseUiId(undefined, nativeId);
  const getInputId = useLabelableId(() => ({ id: idProp }), `${id}-input`);
  const inputId = $derived(getInputId());
  const hiddenInputId = $derived(nativeButton ? undefined : inputId);
  const getAriaLabelledBy = useAriaLabelledBy(() => ({
    explicitAriaLabelledBy: ariaLabelledByProp ?? undefined,
    labelId: labelable.labelId,
    labelSource: inputRef.current,
    enableFallback: !nativeButton,
    generatedLabelId: `${inputId}-label`,
  }));
  const rootProps = $derived({
    role: 'radio',
    'aria-checked': checked,
    'aria-labelledby': getAriaLabelledBy(),
    [ACTIVE_COMPOSITE_ITEM]: checked ? '' : undefined,
    id: nativeButton ? inputId : id,
    onkeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') event.preventDefault();
    },
    onclick(event: MouseEvent) {
      if (event.defaultPrevented || disabled || readOnly) return;
      event.preventDefault();
      const input = inputRef.current;
      if (input) dispatchClickWithModifiers(input, event);
    },
    onfocusin(event: FocusEvent) {
      if (event.defaultPrevented || disabled || readOnly || !group?.touched)
        return;
      inputRef.current?.click();
      group.setTouched(false);
    },
  });
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
    composite: false,
  }));
  const inputProps = $derived({
    type: 'radio',
    form: group?.form,
    id: hiddenInputId,
    name: nativeName(group?.name),
    tabindex: -1,
    style: toNativeStyle(group?.name ? visuallyHiddenInput : visuallyHidden),
    'aria-hidden': true,
    ...(value !== undefined ? { value: serializeValue(value) } : {}),
    disabled,
    checked,
    required,
    readonly: readOnly,
    onclick(event: MouseEvent) {
      // Stop the framework-delegated ancestor handler for this hidden activation.
      // Direct native listeners below the delegate have already observed the click.
      // Native click cancellation rolls radio activation back before input/change.
      event.stopPropagation();
      if (event.defaultPrevented) return;
      if (disabled || readOnly || value === undefined) {
        event.preventDefault();
        return;
      }
      // Native radio click also runs when already selected; source onChange does not.
      // Use the computed source state, including the standalone empty-value fallback.
      if (checked) return;
      const details = createChangeEventDetails(REASONS.none, event);
      group?.setCheckedValue(value, details);
      if (details.isCanceled) {
        event.preventDefault();
        return;
      }
      field.setTouched(true);
    },
    onfocus() {
      radioRef.current?.focus();
    },
  });
  const rootState: RadioRootState = $derived({
    ...field.state,
    required,
    disabled,
    readOnly,
    checked,
  });
  setRadioRootContext(() => rootState);
  
  const rendererProps = $derived([
    rootProps,
    elementProps,
    getButtonProps,
    labelable.getDescriptionProps,
    (props: HTMLProps) =>
      group?.validation
        ? group.validation.getValidationProps(disabled, props)
        : props,
  ]);
  
  
  

const hostAttachmentKeyVisible = createAttachmentKey();
function attachHostVisible(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    radioRef.current = host;
    buttonRef?.(host);
    return () => untrack(() => {
      if (ref === host) ref = null;
      if (radioRef.current === host) radioRef.current = null;
      buttonRef?.(null);
    });
  });
}
const mergedPropsVisible = $derived({ ...mergeComponentProps(rootState, { class: classProp, style: style }, rendererProps, stateAttributesMapping), [hostAttachmentKeyVisible]: attachHostVisible });
const renderStateHidden = $derived({});
const hostAttachmentKeyHidden = createAttachmentKey();
function attachHostHidden(host: HTMLInputElement) {
  return untrack(() => {
    inputRefProp = host as HTMLInputElement;
    inputRef.current = host;
    const disposeInput2 = group?.registerInputRef(host as HTMLInputElement);
    const disposeInput3 = registerInput(host as HTMLInputElement);
    return () => untrack(() => {
      if (inputRefProp === host) inputRefProp = null;
      if (inputRef.current === host) inputRef.current = null;
      disposeInput2?.();
      disposeInput3?.();
    });
  });
}
const mergedPropsHidden = $derived({ ...mergeComponentProps(renderStateHidden, { class: undefined, style: undefined }, inputProps, undefined), [hostAttachmentKeyHidden]: attachHostHidden });
</script>
{#if group}
  <CompositeItem tag="span" {render} class={classProp} {style} state={rootState} props={[...rendererProps, { [hostAttachmentKeyVisible]: attachHostVisible }]} {stateAttributesMapping} {children} />
{:else}
  {#if render}
  {@render render(mergedPropsVisible, rootState, children)}
{:else}
  <span {...mergedPropsVisible}>{@render children?.()}</span>
{/if}
{/if}
<input {...mergedPropsHidden} />
