<!--
	Groups all OTP field parts and manages their state.
	Renders a `<div>` element and a visually hidden validation input.
	Derived from Base UI v1.8.0 packages/react/src/otp-field/root/OTPFieldRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The hidden input is not a ref. Field registration uses the first visible slot.
	Slot order is a local list, the same registration Toolbar uses. Text direction
	is each input's CSS direction.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFieldContext } from '../field/context.svelte.js';
	import { AriaLabelledBy, LabelableId, findLabelableContext } from '../field/labelable.svelte.js';
	import { BoundControl } from '../field/bound-control.svelte.js';
	import { useFormContext } from '../form/context.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { dispatchingValueEvent } from '../internal/value-events.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { visuallyHidden, visuallyHiddenInput, warn } from '@sveltery/utils';
	import { rootStateAttributes } from './attributes.js';
	import { setOTPFieldContext } from './context.svelte.js';
	import { OTPFieldModel } from './model.svelte.js';
	import { toCssStyle } from '../internal/css-style.js';
	import type { OTPFieldRootProps, OTPFieldRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();

	let {
		id: idProp,
		autocomplete: autoComplete = 'one-time-code',
		form: formId,
		length,
		autoSubmit = false,
		mask = false,
		inputmode: inputMode,
		validationType = 'numeric',
		normalizeValue,
		required = false,
		disabled: disabledProp = false,
		readonly: readOnly = false,
		name: nameProp,
		defaultValue = '',
		value = $bindable<string | undefined>(),
		onValueChange,
		onValueInvalid,
		onValueComplete,
		'aria-describedby': ariaDescribedByProp,
		'aria-labelledby': ariaLabelledByProp,
		render,
		children,
		...elementProps
	}: OTPFieldRootProps = $props();

	const field = useFieldContext();
	const bound = new BoundControl<string>(field, {
		kind: 'text',
		read: (): string => raw,
		write: (next) => writeValue(next),
		fromSource: (source) => (source == null ? '' : String(source))
	});

	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = bound.initial(defaultValue);

	const form = useFormContext();
	const labelable = findLabelableContext();

	const raw = $derived(value ?? '');
	const generatedId = $derived(`base-ui-${uid}`);
	const controlId = new LabelableId(labelable, { id: () => idProp, fallback: () => generatedId });
	const disabled = $derived(Boolean(field.disabled) || disabledProp);
	const name = $derived(field.name ?? nameProp);
	const boundProps = $derived(bound.inputProps());
	const inputName = $derived(bound.bound ? boundProps.name : name);

	function writeValue(next: string) {
		value = next;
	}

	const model = new OTPFieldModel({
		getRawValue: () => raw,
		getDefaultValue: () => defaultValue,
		writeValue,
		getLength: () => length,
		getValidationType: () => validationType,
		getNormalizeValue: () => normalizeValue,
		getDisabled: () => disabled,
		getReadOnly: () => readOnly,
		getRequired: () => required,
		getAutoSubmit: () => autoSubmit,
		getAutoComplete: () => autoComplete,
		getMask: () => mask,
		getInputMode: () => inputMode,
		getFormId: () => formId,
		getName: () => name,
		getControlId: () => controlId.current,
		getAriaLabelledByProp: () => ariaLabelledByProp || undefined,
		getGroupLabelledBy: (): string | undefined => ariaLabelledBy.current,
		getOnValueChange: () => onValueChange,
		getOnValueInvalid: () => onValueInvalid,
		getOnValueComplete: () => onValueComplete,
		getField: () => field,
		getForm: () => form
	});
	useValueChanged(
		() => raw,
		(next) => model.afterValueChange(next)
	);
	setOTPFieldContext(model);
	const ariaLabelledBy = new AriaLabelledBy(labelable, {
		explicit: () => ariaLabelledByProp || undefined,
		input: () => model.slots.first,
		labelId: () => `${controlId.current}-label`
	});

	restoreOnReset(() => model.hiddenInput ?? model.root, {
		restore: () => {
			if (raw !== defaultValue) value = defaultValue;
		}
	});

	const describedBy = $derived(
		labelable
			? labelable.describedBy(ariaDescribedByProp || undefined)
			: ariaDescribedByProp || undefined
	);

	function rememberRoot(node: HTMLElement) {
		if (node instanceof HTMLDivElement) model.root = node;
		return () => {
			if (model.root === node) model.root = null;
		};
	}

	$effect(() => {
		model.publishFilled(model.filled);
	});

	$effect(() => {
		const count = model.slots.elements.length;
		const len = length;
		if (!Number.isInteger(len) || len <= 0) {
			warn(
				`<OTPField.Root> \`length\` must be a positive integer. Received \`length={${String(len)}}\`.`
			);
			return;
		}
		if (count === 0 || count === len) return;
		warn(
			'<OTPField.Root> `length` must match the number of rendered ' +
				`<OTPField.Input /> parts. Received \`length={${len}}\` but rendered ` +
				`${count} input${count === 1 ? '' : 's'}.`
		);
	});

	watchFieldControl(field, {
		enabled: () => !disabled,
		id: () => controlId.current,
		name: () => nameProp,
		element: () => model.slots.first ?? null,
		getValue: () => model.value
	});

	const rootState: OTPFieldRootState = $derived(model.state);
	const hiddenStyle = $derived(toCssStyle(inputName ? visuallyHiddenInput : visuallyHidden));
	const showHidden = $derived(model.hasValidLength);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'group',
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		...(model.groupLabelledBy ? { 'aria-labelledby': model.groupLabelledBy } : {}),
		...elementProps,
		...getStateAttributesProps(rootState, rootStateAttributes),
		[rootKey]: rememberRoot
	});

	function hiddenFocused() {
		model.focusInput(0);
	}

	function hiddenEdited(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (!dispatchingValueEvent()) model.handleHiddenInput(event);
	}
</script>

{#if render}
	{@render render(hostProps, rootState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
{#if showHidden}
	<input
		type="text"
		id={inputName == null ? `${controlId.current}-hidden-input` : undefined}
		form={formId}
		name={inputName}
		value={model.value}
		defaultValue={model.defaultValue}
		autocomplete={autoComplete}
		inputmode={model.inputMode}
		minlength={length}
		maxlength={length}
		pattern={model.hiddenPattern}
		{disabled}
		readonly={readOnly}
		{required}
		aria-hidden="true"
		tabindex="-1"
		style={hiddenStyle}
		bind:this={model.hiddenInput}
		onfocus={hiddenFocused}
		oninput={hiddenEdited}
		{...boundProps}
	/>
{/if}
