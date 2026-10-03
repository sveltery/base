<script lang="ts" generics="Value extends number | readonly number[] = number | readonly number[]">
  // Source-ordered port of Base UI SliderRoot.tsx at immutable 47b40521 (MIT).
  import { DEV } from 'esm-env';
  import { ownerDocument } from '../../utils/owner.js';
  import { useControlled } from '../../utils/useControlled.svelte.js';
  import { useStableCallback } from '../../utils/useStableCallback.js';
  import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
  import { warn } from '../../utils/warn.js';
  import { clamp } from '../../utils/clamp.js';
  import { areArraysEqual } from '../../utils/areArraysEqual.js';
  import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { useValueChanged } from '../../internals/useValueChanged.svelte.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { activeElement, contains } from '../../utils/shadowDom.js';
  import { createCompositeList } from '../../internals/composite/list/createCompositeList.svelte.js';
  import type { CompositeMetadata } from '../../internals/composite/list/CompositeListContext.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext.js';
  import { resolveAriaLabelledBy, getDefaultLabelId } from '../../utils/resolveAriaLabelledBy.js';
  import { asc } from '../utils/asc.js';
  import { getSliderValue } from '../utils/getSliderValue.js';
  import { validateMinimumDistance } from '../utils/validateMinimumDistance.js';
  import { sliderStateAttributesMapping } from './stateAttributesMapping.js';
  import { setSliderRootContext } from './SliderRootContext.js';
  import { REASONS } from '../../internals/reasons.js';
  import type { HTMLProps } from '../../internals/types.js';
  import type { SliderRootProps, SliderRootState, SliderRootChangeEventDetails, SliderRootChangeEventReason, SliderRootCommitEventDetails, ThumbMetadata } from '../types.js';
  function areValuesEqual(newValue: number | readonly number[], oldValue: number | readonly number[]) {
    return newValue === oldValue || (Array.isArray(newValue) && Array.isArray(oldValue) && areArraysEqual(newValue, oldValue));
  }
  let {
    'aria-labelledby': ariaLabelledByProp, class: classProp, defaultValue,
    disabled: disabledProp = false, id: idProp, format, largeStep = 10, locale,
    render, max = 100, min = 0, minStepsBetweenValues = 0, form, name: nameProp,
    onValueChange: onValueChangeProp, onValueCommitted: onValueCommittedProp,
    orientation = 'horizontal', step = 1, thumbCollisionBehavior = 'push',
    thumbAlignment = 'center', value: valueProp, style, children,
    ref = $bindable(), ...elementProps
  }: SliderRootProps<Value> = $props();
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const defaultLabelId = $derived(getDefaultLabelId(id));
  const onValueChange = useStableCallback((value: number | number[], details: SliderRootChangeEventDetails) => onValueChangeProp?.(value as Value extends number ? number : Value, details));
  const onValueCommitted = useStableCallback((value: number | readonly number[], details: SliderRootCommitEventDetails) => onValueCommittedProp?.(value as Value extends number ? number : Value, details));
  const formContext = useFormContext();
  const field = useFieldRootContext();
  const labelable = useLabelableContext();
  let labelId = $state<string>();
  const ariaLabelledby = $derived(ariaLabelledByProp ?? resolveAriaLabelledBy(labelable.labelId, labelId));
  const disabled = $derived(field.disabled || disabledProp);
  const name = $derived(field.name ?? nameProp);
  const [getValueUnwrapped, setValueUnwrapped] = useControlled<number | readonly number[]>(() => ({ controlled: valueProp, default: defaultValue ?? min, name: 'Slider' }));
  const valueUnwrapped = $derived(getValueUnwrapped());
  let sliderElement = $state<HTMLElement | null>(null);
  const sliderRef = { get current() { return sliderElement; }, set current(value: HTMLElement | null) { sliderElement = value; } };
  let controlElement = $state<HTMLElement | null>(null);
  const controlRef = { get current() { return controlElement; }, set current(value: HTMLElement | null) { controlElement = value; } };
  const thumbRefs = { current: [] as (HTMLElement | null)[] };
  const pressedThumbCenterOffsetRef = { current: null as number | null };
  const pressedThumbIndexRef = { current: -1 };
  const pressedValuesRef = { current: null as readonly number[] | null };
  const lastChangeReasonRef = { current: REASONS.none as SliderRootChangeEventReason };
  let active = $state(-1);
  let lastUsedThumbIndex = $state(-1);
  let dragging = $state(false);
  let thumbMap = $state.raw<Map<Element, CompositeMetadata & ThumbMetadata>>(new Map());
  let indicatorPosition = $state<(number | undefined)[]>([undefined, undefined]);
  const setActive = useStableCallback((value: number) => { active = value; if (value !== -1) lastUsedThumbIndex = value; });
  const registerFieldControlRef = useStableCallback((element: HTMLElement | null) => { if (element) controlRef.current = element; });
  const range = $derived(Array.isArray(valueUnwrapped));
  const values = $derived.by(() => !range ? [clamp(valueUnwrapped as number, min, max)] : (valueUnwrapped as readonly number[]).map(value => clamp(value, min, max)).sort(asc));
  const fieldValue = $derived(range ? values : values[0]);
  useRegisterFieldControl(field.validation.inputRef, () => id, () => fieldValue, undefined, () => !disabled, () => nameProp);
  useValueChanged(() => fieldValue, () => () => {
    formContext.clearErrors(name);
    field.validation.change(fieldValue);
    const initialValue = field.validityData.initialValue as number | readonly number[] | undefined;
    const isDirty = Array.isArray(fieldValue) && Array.isArray(initialValue) ? !areArraysEqual(fieldValue, initialValue) : fieldValue !== initialValue;
    field.setDirty(isDirty);
  });
  const setValue = useStableCallback((newValue: number | number[], details: SliderRootChangeEventDetails) => {
    if (Number.isNaN(newValue) || areValuesEqual(newValue, valueUnwrapped)) return false;
    const nativeEvent = details.event;
    const EventConstructor = nativeEvent.constructor as typeof Event;
    const clonedEvent = new EventConstructor(nativeEvent.type, nativeEvent);
    Object.defineProperty(clonedEvent, 'target', { writable: true, value: { value: newValue, name } });
    details.event = clonedEvent;
    onValueChange(newValue, details);
    if (details.isCanceled) return false;
    lastChangeReasonRef.current = details.reason;
    setValueUnwrapped(newValue);
    return true;
  });
  const handleInputChange = useStableCallback((valueInput: number, index: number, event: KeyboardEvent | Event) => {
    const newValue = getSliderValue(valueInput, index, min, max, range, values);
    if (validateMinimumDistance(newValue, step, minStepsBetweenValues)) {
      const reason = 'key' in event ? REASONS.keyboard : REASONS.inputChange;
      const applied = setValue(newValue, createChangeEventDetails(reason, event, undefined, { activeThumbIndex: index }));
      field.setTouched(true);
      if (applied) onValueCommitted(newValue, createGenericEventDetails(reason, event));
    }
  });
  if (DEV) $effect(() => { if (min >= max) warn('Slider `max` must be greater than `min`.'); });
  useIsoLayoutEffect(() => {
    if (!disabled) return;
    const activeEl = activeElement(ownerDocument(sliderRef.current));
    if (contains(sliderRef.current, activeEl)) (activeEl as HTMLElement).blur();
    if (active !== -1) setActive(-1);
  }, () => [active, disabled, setActive]);
  const sliderState: SliderRootState = $derived({ ...field.state, activeThumbIndex: active, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values });
  setSliderRootContext({
    get active() { return active; }, controlRef, get disabled() { return disabled; }, get dragging() { return dragging; }, validation: field.validation,
    get format() { return format; }, handleInputChange, get indicatorPosition() { return indicatorPosition; }, get inset() { return thumbAlignment !== 'center'; },
    get labelId() { return ariaLabelledby; }, get rootLabelId() { return defaultLabelId; }, get largeStep() { return largeStep; }, get lastUsedThumbIndex() { return lastUsedThumbIndex; }, lastChangeReasonRef,
    get form() { return form; }, get locale() { return locale; }, get max() { return max; }, get min() { return min; }, get minStepsBetweenValues() { return minStepsBetweenValues; }, get name() { return name; },
    onValueCommitted, get orientation() { return orientation; }, pressedThumbCenterOffsetRef, pressedThumbIndexRef, pressedValuesRef, registerFieldControlRef,
    get renderBeforeHydration() { return thumbAlignment === 'edge'; }, setActive,
    setDragging(value) { dragging = value; }, setIndicatorPosition(value) { indicatorPosition = typeof value === 'function' ? value(indicatorPosition) : value; }, setLabelId(value) { labelId = value; },
    setValue, get state() { return sliderState; }, get step() { return step; }, get thumbCollisionBehavior() { return thumbCollisionBehavior; }, get thumbMap() { return thumbMap; }, thumbRefs, get values() { return values; },
  });
  createCompositeList(() => ({ elementsRef: thumbRefs, onMapChange(map) { thumbMap = map as Map<Element, CompositeMetadata & ThumbMetadata>; } }));
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const params = $derived({ state: sliderState, ref: [forwardedRef, sliderRef], props: [{ 'aria-labelledby': ariaLabelledby, id, role: 'group' }, elementProps, (props: HTMLProps) => field.validation.getValidationProps(disabled, props)], stateAttributesMapping: sliderStateAttributesMapping });
</script>
<RenderElement tag="div" componentProps={{ render, class: classProp, style }} {params} {children} />
