<!--
	Groups all parts of the number field and manages its state.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/number-field/root/NumberFieldRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The hidden input is not a ref. Field validates it, and registers the visible input inside NumberField.Input.
	Native input props and handlers go to the hidden `<input type="number">` that submits.
	`class`, `style` and `host` go to this element. There is no `onValueChange` or
	`onValueCommitted`: the hidden input fires `input` when the value changes and `change` when
	it is committed.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { BROWSER } from 'esm-env';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFormContext } from '../internal/form-context.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { dispatchingValueEvent } from '../internal/value-events.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { chain, mergeProps } from '../internal/mergeProps.js';
	import { watchSpreadPath } from '../field/watch-spread-path.svelte.js';
	import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils';
	import { numberFieldStateAttributes } from './attributes.js';
	import { setNumberFieldContext } from './context.svelte.js';
	import { NumberFieldModel, type NumberFieldChangeEventDetails } from './model.svelte.js';
	import { readNumber } from './read-value.js';
	import { toCssStyle } from '../internal/css-style.js';
	import type { NumberFieldRootProps, NumberFieldRootState } from './types.js';

	const uid = $props.id();

	let {
		id: idProp,
		min,
		max,
		smallStep = 0.1,
		step: stepProp = 1,
		largeStep = 10,
		required: requiredProp,
		disabled: disabledProp,
		readonly: readOnlyProp,
		name: nameProp,
		form: formId,
		defaultValue: defaultValueProp = null,
		value = $bindable<number | string | null | undefined>(),
		type: _type,
		allowWheelScrub = false,
		snapOnStep = false,
		allowOutOfRange = false,
		format,
		locale,
		class: className,
		style,
		host,
		oninput,
		onchange,
		render,
		children,
		...inputProps
	}: NumberFieldRootProps = $props();
	const required = $derived(requiredProp ?? false);
	const readOnly = $derived(readOnlyProp ?? false);

	const field = useFieldContext();
	const form = useFormContext();
	const labelable = useLabelableContext();
	watchSpreadPath(field, form, () => nameProp);

	// Without a spread, a number field in a named Field of a remote form binds itself to it.
	const bound = $derived(
		nameProp === undefined ? field.bindRemote('number', readNumber(defaultValueProp)) : undefined
	);
	const defaultValue = $derived(readNumber(defaultValueProp));
	// `defaultValue` is the initial value of an empty binding, as in HTML. A bound field starts
	// at the value the form holds, which a failed submit echoes back.
	// svelte-ignore state_referenced_locally
	if (value === undefined || value === '') value = readNumber(bound?.value) ?? defaultValue;

	const current = $derived<number | null>(readNumber(value));
	// The reason of the write this component made. A parent write has none.
	let writeReason: string | undefined;
	useValueChanged(
		() => current,
		(next) => {
			const reason = writeReason;
			writeReason = undefined;
			field.clearExternalErrors();
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
	const disabled = $derived(Boolean(field.disabled) || (disabledProp ?? false));
	// The field's own name wins: a remote form encodes the value type and its id in it.
	const name = $derived(
		nameProp ?? (bound?.name as string | undefined) ?? (form.remote ? undefined : field.name)
	);
	const inputName = $derived(name);
	const step = $derived(stepProp === 'any' ? 1 : stepProp);
	const generatedId = $derived(`base-ui-${uid}`);
	const controlId = new LabelableId(labelable, {
		id: () => idProp ?? undefined,
		fallback: () => generatedId
	});

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
		getField: () => field,
		getId: () => controlId.current,
		getName: () => name,
		getNameProp: () => nameProp ?? undefined
	});
	setNumberFieldContext(model);

	// Field reads validity from the hidden number input, as upstream does. Its `min` and `max`
	// report an out-of-range value that `allowOutOfRange` keeps. Form focuses the visible input.
	$effect(() => {
		const input = model.hiddenInput;
		if (!input) return;
		return field.registerInput(input, { element: model.inputElement, value: undefined });
	});

	const rootState: NumberFieldRootState = $derived(model.state);
	const hiddenStyle = $derived(toCssStyle(inputName ? visuallyHiddenInput : visuallyHidden));

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			host,
			{ class: className, style: style ?? undefined },
			getStateAttributesProps(rootState, numberFieldStateAttributes)
		)
	);

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
		field.clearExternalErrors();
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
<!-- Typing reaches this input only through JavaScript, so `required` waits for the browser. -->
<input
	{...inputProps}
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
	required={BROWSER && required}
	aria-hidden="true"
	tabindex="-1"
	style={hiddenStyle}
	oninput={chain(hiddenChanged, oninput)}
	onchange={chain(hiddenChanged, onchange)}
	onfocus={hiddenFocused}
/>
