<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Source-ordered business port of Base UI v1.8.0 CheckboxRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { useFieldControlNativeName } from '../../internals/field-control-name/FieldControlNameContext.js';
  import { useFieldControlNativeValue } from '../../internals/field-control-value/FieldControlValueContext.js';
  import { mergePropsN } from '../../merge-props/index.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { Controlled } from '@sveltery/utils/Controlled';

  import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { EnterSubmitOwner } from '../utils/useEnterSubmit.svelte.js';
  import { getCheckboxStateAttributesMapping } from '../utils/getCheckboxStateAttributesMapping.js';
  import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import { useButton } from '../../internals/use-button/useButton.svelte.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFieldItemContext } from '../../field/item/FieldItemContext.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext.js';
  import { AriaLabelledByOwner } from '../../internals/labelable-provider/useAriaLabelledBy.svelte.js';
  import { LabelableIdOwner } from '../../internals/labelable-provider/useLabelableId.svelte.js';
  import { useCheckboxGroupContext } from '../../checkbox-group/CheckboxGroupContext.js';
  import { setCheckboxRootContext } from './CheckboxRootContext.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { ValueChanged } from '../../internals/ValueChanged.svelte.js';
  import type { CheckboxRootProps, CheckboxRootState } from '../types.js';
  let {
    checked: checkedProp,
    class: classProp,
    defaultChecked = false,
    'aria-labelledby': ariaLabelledByProp,
    disabled: disabledProp = false,
    form,
    id: idProp,
    indeterminate = false,
    inputRef: inputRefProp = $bindable(),
    name: nameProp,
    onCheckedChange,
    parent = false,
    readOnly = false,
    render,
    required = false,
    uncheckedValue,
    value: valueProp,
    nativeButton = false,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: CheckboxRootProps = $props();
  const formContext = useFormContext();
  const field = useFieldRootContext();
  const fieldItem = useFieldItemContext();
  const labelable = useLabelableContext();
  const groupContext = useCheckboxGroupContext();
  const parentContext = $derived(
    groupContext?.allValues === undefined ? undefined : groupContext.parent,
  );
  const isGroupedWithParent = $derived(parentContext !== undefined);
  const disabled = $derived(
    Boolean(field.disabled || fieldItem.disabled || groupContext?.disabled || disabledProp),
  );
  const name = $derived(field.name ?? nameProp);
  const getNativeName = useFieldControlNativeName();
  const nativeName = $derived(getNativeName(name));
  const getNativeValue = useFieldControlNativeValue();
  const value = $derived(valueProp ?? name);
  const instanceId = $props.id();
  const id = useBaseUiId(undefined, instanceId);
  const ownsControlId = $derived(groupContext?.registerControlId !== labelable.registerControlId);
  const labelableId = new LabelableIdOwner(
    () => ({ id: idProp || undefined, enabled: ownsControlId }),
    `${id}-input`,
  );
  const controlId = $derived(labelableId.getId());
  const rootId = $derived(nativeButton ? controlId : id);
  const groupProps: Partial<
    Pick<CheckboxRootProps, 'checked' | 'indeterminate' | 'onCheckedChange'> & {
      'aria-controls': string;
    }
  > = $derived.by(() => {
    if (!parentContext) return {};
    if (parent) return parentContext.getParentProps();
    if (value !== undefined) return parentContext.getChildProps(value);
    return {};
  });
  const groupChecked = $derived(groupProps.checked ?? checkedProp);
  const groupIndeterminate = $derived(groupProps.indeterminate ?? indeterminate);
  const groupOnChange = $derived(groupProps.onCheckedChange);
  const otherGroupProps = $derived.by(() => {
    // These belong to checked state/callback logic, not host attributes.
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- source checked props are intentionally omitted from host attributes
      checked: _checked,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- source checked props are intentionally omitted from host attributes
      indeterminate: _indeterminate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- source callback stays in checked business logic
      onCheckedChange: _onCheckedChange,
      ...other
    } = groupProps as {
      checked?: boolean;
      indeterminate?: boolean;
      onCheckedChange?: unknown;
      'aria-controls'?: string;
    };
    return other;
  });
  const controlRef = $state<{ current: HTMLElement | null }>({ current: null });
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const validation = $derived(groupContext?.validation ?? field.validation);
  const checkedState = new Controlled(
    () =>
      value !== undefined && groupContext !== undefined && !parent
        ? groupContext.value.includes(value)
        : groupChecked,
    untrack(() => defaultChecked),
  );
  const checked = $derived(checkedState.value);
  const computedChecked = $derived(isGroupedWithParent ? Boolean(groupChecked) : checked);
  const computedIndeterminate = $derived(
    Boolean(isGroupedWithParent ? groupIndeterminate || indeterminate : indeterminate),
  );
  useRegisterFieldControl(
    controlRef,
    () => id,
    () => checked,
    undefined,
    () => !groupContext && !disabled,
    () => nameProp,
  );
  const inputRef = $state<{ current: HTMLInputElement | null }>({
    current: null,
  });
  const registeredInputValue = $derived(groupContext ? value : undefined);
  const registerInput = $derived.by(() => {
    // Read the original callback dependencies before returning the native ref.
    const currentValidation = validation;
    const inputValue = registeredInputValue;
    return (element: HTMLInputElement | null) =>
      element
        ? currentValidation.registerInput(element, {
            controlRef,
            value: inputValue,
          })
        : undefined;
  });
  const ariaLabelledBy = new AriaLabelledByOwner(() => ({
    explicitAriaLabelledBy: ariaLabelledByProp ?? undefined,
    labelId: labelable.labelId,
    labelSource: inputRef.current,
    enableFallback: !nativeButton,
    generatedLabelId: `${controlId}-label`,
  }));
  $effect(() => {
    // Native activation resets indeterminate; checked changes reassert the business state.
    const isChecked = checked;
    const input = inputRef.current;
    if (input) input.indeterminate = computedIndeterminate;
    if (!groupContext) field.setFilled(isChecked);
  });
  new ValueChanged(
    () => checked,
    () => () => {
      if (groupContext) return;
      formContext.clearErrors(name);
      field.setDirty(checked !== field.validityData.initialValue);
      validation.change(checked);
    },
  );
  const inputProps = $derived({
    defaultChecked,
    disabled,
    form,
    name: parent ? undefined : nativeName,
    id: nativeButton ? undefined : controlId,
    required,
    style: toNativeStyle(name ? visuallyHiddenInput : visuallyHidden),
    tabindex: -1,
    type: 'checkbox',
    'aria-hidden': true,
    onclick(event: MouseEvent) {
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
      groupOnChange?.(nextChecked, details);
      if (details.isCanceled) {
        event.preventDefault();
        return;
      }
      checkedState.set(nextChecked);
      if (value !== undefined && groupContext !== undefined && !parent && !isGroupedWithParent) {
        groupContext.setValue(
          nextChecked
            ? [...groupContext.value, value]
            : groupContext.value.filter((item) => item !== value),
          details,
        );
        if (details.isCanceled) event.preventDefault();
      }
    },
    onfocus() {
      controlRef.current?.focus();
    },
    ...(valueProp !== undefined
      ? {
          value: getNativeValue((groupContext ? checked && valueProp : valueProp) || ''),
        }
      : {}),
  });
  $effect(() => {
    if (!parentContext || value === undefined) return;
    const disabledStates = parentContext.disabledStatesRef.current;
    disabledStates.set(value, disabled);
    return () => {
      disabledStates.delete(value);
    };
  });
  const rootState: CheckboxRootState = $derived({
    ...field.state,
    checked: computedChecked,
    disabled,
    readOnly,
    required,
    indeterminate: computedIndeterminate,
  });
  const stateAttributesMapping = $derived(getCheckboxStateAttributesMapping(rootState));
  const enterSubmit = new EnterSubmitOwner(controlRef, inputRef);
  const rootProps = $derived({
    id: rootId,
    role: 'checkbox',
    'aria-checked': computedIndeterminate ? 'mixed' : computedChecked,
    'aria-readonly': readOnly || undefined,
    'aria-required': required || undefined,
    'aria-labelledby': ariaLabelledBy.getAriaLabelledBy(),
    'data-parent': parent ? '' : undefined,
    onfocus() {
      if (!disabled) field.setFocused(true);
    },
    onblur() {
      const input = inputRef.current;
      if (!input) return;
      field.setTouched(true);
      field.setFocused(false);
      if (field.validationMode === 'onBlur')
        void validation.commit(groupContext ? groupContext.value : input.checked);
    },
    onkeydown: enterSubmit.handleEnterSubmit,
    onclick(event: MouseEvent) {
      if (readOnly || disabled) return;
      event.preventDefault();
      const input = inputRef.current;
      if (input) dispatchClickWithModifiers(input, event);
    },
  });
  // Register actual rendered IDs. Native snippets are opaque; DOM ID association
  // observes the rendered element rather than inspecting a React clone.
  $effect(() => {
    const element = controlRef.current;
    const context = parentContext;
    const childValue = value;
    if (!element || !context || parent || childValue === undefined) return;
    let unregister: (() => void) | undefined;
    const update = () =>
      untrack(() => {
        unregister?.();
        unregister = element.id ? context.registerChildId(childValue, element.id) : undefined;
      });
    update();
    const observer = new element.ownerDocument.defaultView!.MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ['id'] });
    return () => {
      observer.disconnect();
      untrack(() => unregister?.());
    };
  });
  setCheckboxRootContext(() => rootState);

  const hiddenInputProps = $derived(
    mergePropsN([
      inputProps,
      labelable.getDescriptionProps,
      (props: Record<string, unknown>) => validation.getValidationProps(disabled, props),
    ]),
  );
  function attachInput(host: HTMLInputElement) {
    const hasParent = parent;
    const register = registerInput;
    return untrack(() => {
      inputRef.current = host;
      inputRefProp = host;
      const unregister = hasParent ? undefined : register(host);
      return () =>
        untrack(() => {
          unregister?.();
          if (inputRef.current === host) inputRef.current = null;
          if (inputRefProp === host) inputRefProp = null;
        });
    });
  }

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      buttonRef?.(host);
      controlRef.current = host;
      ref = host;
      return () =>
        untrack(() => {
          buttonRef?.(null);
          if (controlRef.current === host) controlRef.current = null;
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      rootState,
      { class: classProp, style: style },
      [
        rootProps,
        elementProps,
        otherGroupProps,
        getButtonProps,
        labelable.getDescriptionProps,
        (props: Record<string, unknown>) => validation.getValidationProps(disabled, props),
      ],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, rootState, children)}
{:else}
  <span {...mergedProps}>{@render children?.()}</span>
{/if}
{#if !checked && !groupContext && name && !parent && uncheckedValue !== undefined}
  <input type="hidden" {form} name={nativeName} value={uncheckedValue} {disabled} />
{/if}
<!-- Native binding owns checkbox DOM/default/hydration and form-reset behavior. -->
<input
  {...hiddenInputProps as HTMLInputAttributes}
  type="checkbox"
  {@attach attachInput}
  bind:checked={() => checkedState.value, (next) => checkedState.set(next)}
/>
