<!--
	Represents the switch itself.
	Renders a `<span>` box with a real `<input type="checkbox" role="switch">` laid over it.
	Derived from Base UI v1.9.0 packages/react/src/switch/root/SwitchRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Native input props and handlers go to the input, so it works without JavaScript and fires
	real `input` and `change` events. `class`, `style` and `host` go to the box.
-->
<script lang="ts">
	import { chain } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { switchStateAttributesMapping } from './attributes.js';
	import { setSwitchContext } from './context.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import { overlayInputStyle } from '../internal/overlay-input.js';
	import type { SwitchBoxProps, SwitchRootProps, SwitchRootState } from './types.js';

	const uid = $props.id();
	const field = useFieldContext();
	const formContext = useFormContext();
	const labelable = useLabelableContext();

	let {
		checked = $bindable(),
		defaultChecked = false,
		disabled: disabledProp,
		readonly: readOnlyProp,
		required: requiredProp,
		name: nameProp,
		value,
		uncheckedValue,
		form,
		id,
		type: _type,
		class: className,
		style,
		host,
		onclick,
		onfocus,
		onblur,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...inputProps
	}: SwitchRootProps = $props();
	const readOnly = $derived(readOnlyProp ?? false);
	const required = $derived(requiredProp ?? false);

	// Without a spread, a switch in a named Field of a remote form names itself from the field.
	const bound = $derived(nameProp === undefined ? field.bindRemote('checkbox') : undefined);

	// `defaultChecked` is the initial value of an empty binding, as in HTML. A spread's `checked`
	// is the remote form's value.
	// svelte-ignore state_referenced_locally
	if (checked === undefined) checked = (bound?.checked as boolean | undefined) ?? defaultChecked;

	const generatedControlId = `base-ui-${uid}-control`;
	const controlId = new LabelableId(labelable, {
		id: () => id ?? undefined,
		fallback: () => generatedControlId
	});
	const inputId = $derived(id || controlId.current || generatedControlId);
	const disabled = $derived(field.disabled || (disabledProp ?? false));
	// The control's own name wins: a remote form encodes the value type and its id in it.
	const name = $derived(
		nameProp ?? (bound?.name as string | undefined) ?? (formContext.remote ? undefined : field.name)
	);

	const checkedState = $derived(checked === true);
	const switchState: SwitchRootState = $derived({
		...field.state,
		checked: checkedState,
		disabled,
		readOnly,
		required
	});

	setSwitchContext({
		get checked() {
			return checkedState;
		},
		get disabled() {
			return Boolean(disabled);
		},
		get readOnly() {
			return Boolean(readOnly);
		},
		get required() {
			return Boolean(required);
		}
	});

	let inputNode = $state<HTMLInputElement | null>(null);
	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => inputNode
	});
	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	const invalid = $derived(field.valid === false && !disabled);
	const labelledBy = $derived(
		ariaLabelledByProp ?? (inputProps['aria-label']?.trim() ? undefined : labelable.labelId)
	);

	const fieldControl = attachFieldControl(field, {
		enabled: () => !disabled,
		id: () => inputId,
		name: () => nameProp ?? undefined,
		getValue: () => checkedState
	});

	new FieldValueSync(field, formContext, {
		value: () => checkedState,
		name: () => name,
		filled: (value) => value
	});

	$effect(() => {
		const input = inputNode;
		if (!input) return;
		return field.registerInput(input, { element: input, value: undefined });
	});

	let uncheckedNode = $state<HTMLInputElement | null>(null);

	restoreOnReset(() => inputNode, {
		restore: () => {
			if (checked !== defaultChecked) checked = defaultChecked;
		},
		// Puts the input back in step when the owner kept `checked`.
		settle: () => {
			if (inputNode && inputNode.checked !== checkedState) inputNode.checked = checkedState;
			if (uncheckedNode) uncheckedNode.checked = !checkedState;
		}
	});

	function registerInput(element: HTMLElement) {
		inputNode = element as HTMLInputElement;
		const release = fieldControl(element);
		return () => {
			release?.();
			if (inputNode === element) inputNode = null;
		};
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (readOnly || disabled) {
			event.preventDefault();
			return;
		}
		checked = event.currentTarget.checked;
	}

	function handleFocus() {
		focusOwner.set(true);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (disabled) return;
		field.setTouched(true);
		focusOwner.set(false);
		if (field.validationMode === 'onBlur') field.commit(event.currentTarget.checked);
	}

	const boxProps: SwitchBoxProps = $derived({
		...getStateAttributesProps(switchState, switchStateAttributesMapping),
		...host,
		class: className,
		style: style ? `position: relative; ${style}` : 'position: relative'
	});
</script>

{#snippet content()}
	<input
		{...inputProps}
		type="checkbox"
		role="switch"
		id={inputId}
		name={name ?? undefined}
		{value}
		checked={checkedState}
		{defaultChecked}
		{disabled}
		{form}
		{required}
		style={overlayInputStyle}
		aria-readonly={readOnly || undefined}
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		aria-invalid={invalid || undefined}
		onclick={handleClick}
		onfocus={chain(handleFocus, onfocus)}
		onblur={chain(handleBlur, onblur)}
		{@attach registerInput}
	/>
	{#if name && uncheckedValue !== undefined}
		<!-- Submits `uncheckedValue`. A native reset restores it with the switch above, so
		FormData never holds both values. -->
		<input
			bind:this={uncheckedNode}
			type="checkbox"
			hidden
			style="display: none !important"
			checked={!checkedState}
			defaultChecked={!defaultChecked}
			{disabled}
			{form}
			{name}
			value={uncheckedValue}
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(boxProps, switchState, content)}
{:else}
	<span {...boxProps}>{@render content()}</span>
{/if}
