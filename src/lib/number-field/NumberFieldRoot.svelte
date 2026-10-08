<!--
	Groups all parts of the number field and manages its state.
	Renders a `<div>` element and a visually hidden number input for form submission.
	Derived from Base UI v1.8.0 packages/react/src/number-field/root/NumberFieldRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The hidden input is not a ref. Field registration uses the visible input inside NumberField.Input.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFormContext } from '../form/context.js';
	import { useFieldContext } from '../field/context.svelte.js';
	import { useLabelableContext } from '../field/labelable.svelte.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { visuallyHidden, visuallyHiddenInput } from '../internal/visuallyHidden.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { setNumberFieldContext } from './context.svelte.js';
	import { NumberFieldModel } from './model.svelte.js';
	import { toCssStyle } from '../internal/css-style.js';
	import type { NumberFieldRootProps, NumberFieldRootState } from './types.js';

	const uid = $props.id();
	const idSource = Symbol('number-field-id');

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
		name: nameProp,
		form: formId,
		defaultValue = null,
		value = $bindable<number | null | undefined>(),
		onValueChange,
		onValueCommitted,
		allowWheelScrub = false,
		snapOnStep = false,
		allowOutOfRange = false,
		format,
		locale,
		render,
		children,
		...elementProps
	}: NumberFieldRootProps = $props();

	const field = useFieldContext(true);
	const form = useFormContext();
	const labelable = useLabelableContext(true);

	const controllable = createControllableValue<number | null>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue,
		onChange(next) {
			form.clearErrors(name);
			field?.setDirty(next !== field.validityData.initialValue);
			if (model.blockRevalidation && !field?.shouldValidateOnChange()) {
				model.blockRevalidation = false;
				return;
			}
			field?.change(next);
		}
	});
	const current = $derived<number | null>(controllable.value ?? null);
	const disabled = $derived(Boolean(field?.disabled) || disabledProp);
	const name = $derived(field?.name ?? nameProp);
	const step = $derived(stepProp === 'any' ? 1 : stepProp);
	const generatedId = $derived(`base-ui-${uid}`);
	const controlId = $derived(labelable?.controlId || idProp || generatedId);

	let hadExplicitId = false;

	let model: NumberFieldModel;

	function writeValue(next: number | null) {
		if (Object.is(current, next)) {
			field?.setDirty(next !== field.validityData.initialValue);
			return;
		}
		controllable.set(next);
	}

	model = new NumberFieldModel({
		getValue: () => current,
		writeValue,
		getMin: () => min,
		getMax: () => max,
		getSmallStep: () => smallStep,
		getStep: () => step,
		getLargeStep: () => largeStep,
		getRequired: () => required,
		getDisabled: () => disabled,
		getReadOnly: () => readOnly,
		getAllowOutOfRange: () => allowOutOfRange,
		getSnapOnStep: () => snapOnStep,
		getAllowWheelScrub: () => allowWheelScrub,
		getFormat: () => format,
		getLocale: () => locale,
		getOnValueChange: () => onValueChange,
		getOnValueCommitted: () => onValueCommitted,
		getField: () => field,
		getId: () => controlId,
		getName: () => name,
		getNameProp: () => nameProp
	});
	setNumberFieldContext(model);

	$effect(() => {
		if (!labelable) return;
		const explicit = idProp;
		const fallback = generatedId;
		untrack(() => {
			if (explicit !== undefined) {
				hadExplicitId = true;
				labelable.registerControlId(idSource, explicit);
			} else if (hadExplicitId) {
				labelable.registerControlId(idSource, fallback);
			} else {
				labelable.registerControlId(idSource, undefined);
				labelable.resetControlId();
			}
		});
		return () => {
			untrack(() => labelable.registerControlId(idSource, undefined));
		};
	});

	const rootState: NumberFieldRootState = $derived(model.state);
	const hiddenStyle = $derived(toCssStyle(name ? visuallyHiddenInput : visuallyHidden));

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(rootState, numberFieldStateAttributes)
	});

	function hiddenChanged(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const next = model.handleHiddenChange(event);
		if (next === false) return;
		form.clearErrors(name);
		field?.change(next);
	}

	function hiddenFocused() {
		model.focusInput();
	}
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, rootState, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
<input
	type="number"
	form={formId}
	{name}
	value={current ?? ''}
	{min}
	{max}
	step={stepProp}
	{disabled}
	readonly={readOnly}
	{required}
	aria-hidden="true"
	tabindex="-1"
	style={hiddenStyle}
	onchange={hiddenChanged}
	oninput={hiddenChanged}
	onfocus={hiddenFocused}
/>
