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
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { devWarn } from '../collapsible/warn.js';
	import { useFieldContext } from '../field/context.svelte.js';
	import { useLabelableContext } from '../field/labelable.svelte.js';
	import { useFormContext } from '../form/context.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { visuallyHidden, visuallyHiddenInput } from '../internal/visuallyHidden.js';
	import { rootStateAttributes } from './attributes.js';
	import { setOTPFieldContext } from './context.svelte.js';
	import { OTPFieldModel } from './model.svelte.js';
	import { toCssStyle } from '../internal/css-style.js';
	import type { OTPFieldRootProps, OTPFieldRootState } from './types.js';

	const uid = $props.id();
	const idSource = Symbol('otp-field-id');
	const rootKey = createAttachmentKey();

	let {
		id: idProp,
		autoComplete = 'one-time-code',
		form: formId,
		length,
		autoSubmit = false,
		mask = false,
		inputMode,
		validationType = 'numeric',
		normalizeValue,
		required = false,
		disabled: disabledProp = false,
		readOnly = false,
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
	const form = useFormContext();
	const labelable = useLabelableContext(true);

	const controllable = createControllableValue<string>({
		getProp: () => value,
		setProp: (next) => {
			value = next ?? '';
		},
		getDefault: () => defaultValue
	});
	const raw = $derived(controllable.value ?? '');
	const generatedId = $derived(`base-ui-${uid}`);
	const controlId = $derived(labelable?.controlId || idProp || generatedId);
	const disabled = $derived(Boolean(field.disabled) || disabledProp);
	const name = $derived(field.name ?? nameProp);

	let hadExplicitId = false;

	function writeValue(next: string) {
		controllable.set(next);
	}

	const model = new OTPFieldModel({
		getRawValue: () => raw,
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
		getControlId: () => controlId,
		getAriaLabelledByProp: () => ariaLabelledByProp || undefined,
		getLabelId: () => labelable?.labelId,
		getOnValueChange: () => onValueChange,
		getOnValueInvalid: () => onValueInvalid,
		getOnValueComplete: () => onValueComplete,
		getField: () => field,
		getForm: () => form
	});
	setOTPFieldContext(model);

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
		model.noteValue(model.value);
	});

	$effect(() => {
		model.publishFilled(model.filled);
	});

	$effect(() => {
		const explicit = ariaLabelledByProp || undefined;
		const labelId = labelable?.labelId;
		model.syncFallbackLabel(explicit, labelId);
	});

	$effect(() => {
		const count = model.slots.elements.length;
		const len = length;
		if (!Number.isInteger(len) || len <= 0) {
			devWarn(
				`<OTPField.Root> \`length\` must be a positive integer. Received \`length={${String(len)}}\`.`
			);
			return;
		}
		if (count === 0 || count === len) return;
		devWarn(
			'<OTPField.Root> `length` must match the number of rendered ' +
				`<OTPField.Input /> parts. Received \`length={${len}}\` but rendered ` +
				`${count} input${count === 1 ? '' : 's'}.`
		);
	});

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

	watchFieldControl(field, {
		enabled: () => !disabled,
		id: () => controlId,
		name: () => nameProp,
		element: () => model.slots.first ?? null,
		getValue: () => model.value
	});

	const rootState: OTPFieldRootState = $derived(model.state);
	const hiddenStyle = $derived(toCssStyle(name ? visuallyHiddenInput : visuallyHidden));
	const showHidden = $derived(model.hasValidLength);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'group',
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		...(model.groupLabelledBy ? { 'aria-labelledby': model.groupLabelledBy } : {}),
		...elementProps,
		...getStateAttributesProps(rootState, rootStateAttributes),
		...(render ? { [rootKey]: rememberRoot } : {})
	});

	function hiddenFocused() {
		model.focusInput(0);
	}

	function hiddenEdited(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		model.handleHiddenInput(event);
	}
</script>

{#if render}
	{@render render(hostProps, rootState, children)}
{:else}
	<div {...hostProps} bind:this={model.root}>{@render children?.()}</div>
{/if}
{#if showHidden}
	<input
		type="text"
		id={controlId && name == null ? `${controlId}-hidden-input` : undefined}
		form={formId}
		{name}
		value={model.value}
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
	/>
{/if}
