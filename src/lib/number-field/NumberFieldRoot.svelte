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
	import { LabelableId, findLabelableContext } from '../field/labelable.svelte.js';
	import { BoundControl } from '../field/bound-control.svelte.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { dispatchingValueEvent } from '../internal/value-events.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils';
	import { numberFieldStateAttributes } from './attributes.js';
	import { setNumberFieldContext } from './context.svelte.js';
	import { NumberFieldModel } from './model.svelte.js';
	import { toCssStyle } from '../internal/css-style.js';
	import type {
		NumberFieldChangeEventDetails,
		NumberFieldRootProps,
		NumberFieldRootState
	} from './types.js';

	const uid = $props.id();

	let {
		id: idProp,
		min,
		max,
		smallStep = 0.1,
		step: stepProp = 1,
		largeStep = 10,
		required = false,
		disabled: disabledProp = false,
		readonly: readOnly = false,
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

	const field = useFieldContext();
	// A source holds `undefined` for a cleared number input, and for one never set.
	const bound = new BoundControl<number | null>(field, {
		kind: 'number',
		read: (): number | null => current,
		write: (next) => writeValue(next),
		fromSource: (raw) => (typeof raw === 'number' ? raw : null)
	});

	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = bound.initial(defaultValue);

	const form = useFormContext();
	const labelable = findLabelableContext();

	const current = $derived<number | null>(value ?? null);
	// The reason of the write this component made. A parent write has none.
	let writeReason: string | undefined;
	useValueChanged(
		() => current,
		(next) => {
			const reason = writeReason;
			writeReason = undefined;
			form.clearErrors(name);
			field.setDirty(next !== field.validityData.initialValue);
			// Blur already committed when this mode does not validate on change.
			// A second pass would clear that result.
			if (
				(reason === 'input-blur' || reason === 'input-clear') &&
				!field.shouldValidateOnChange()
			) {
				return;
			}
			field.change(next);
		}
	);
	const disabled = $derived(Boolean(field.disabled) || disabledProp);
	const name = $derived(field.name ?? nameProp);
	const boundProps = $derived(bound.inputProps());
	const inputName = $derived(bound.bound ? boundProps.name : name);
	const step = $derived(stepProp === 'any' ? 1 : stepProp);
	const generatedId = $derived(`base-ui-${uid}`);
	const controlId = new LabelableId(labelable, { id: () => idProp, fallback: () => generatedId });

	function writeValue(next: number | null, details?: NumberFieldChangeEventDetails) {
		const previous = current;
		if (Object.is(previous, next)) return;
		writeReason = details?.reason;
		value = next;
		// A `bind:value={get, set}` parent that keeps its value never runs the change effect.
		if (
			Object.is(
				untrack(() => current),
				previous
			)
		)
			writeReason = undefined;
	}

	const model = new NumberFieldModel({
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
		getId: () => controlId.current,
		getName: () => name,
		getNameProp: () => nameProp
	});
	setNumberFieldContext(model);

	const rootState: NumberFieldRootState = $derived(model.state);
	const hiddenStyle = $derived(toCssStyle(inputName ? visuallyHiddenInput : visuallyHidden));

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(rootState, numberFieldStateAttributes)
	});

	restoreOnReset(() => model.hiddenInput, {
		restore: () => {
			model.followInputValue();
			writeValue(defaultValue);
		},
		// The shown text has no default of its own to reset to when the value did not change.
		settle: () => {
			const input = model.inputElement;
			if (input && input.value !== model.inputValue) input.value = model.inputValue;
		}
	});

	function hiddenChanged(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (dispatchingValueEvent()) return;
		const next = model.handleHiddenChange(event);
		if (next === false) return;
		form.clearErrors(name);
	}

	function hiddenFocused() {
		model.focusInput();
	}
</script>

{#if render}
	{@render render(hostProps, rootState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
<input
	bind:this={model.hiddenInput}
	type="number"
	form={formId}
	name={inputName}
	value={current ?? ''}
	defaultValue={defaultValue ?? ''}
	{min}
	{max}
	step={stepProp}
	{disabled}
	readonly={readOnly}
	{required}
	aria-hidden="true"
	tabindex="-1"
	style={hiddenStyle}
	oninput={hiddenChanged}
	onchange={hiddenChanged}
	onfocus={hiddenFocused}
	{...boundProps}
/>
