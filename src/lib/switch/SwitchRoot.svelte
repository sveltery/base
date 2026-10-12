<!--
	Represents the switch itself. Renders a `<span>` and a hidden checkbox beside it.
	Derived from Base UI v1.8.0 packages/react/src/switch/root/SwitchRoot.tsx
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { dispatchClick } from '../internal/click.js';
	import { toCssStyle } from '../internal/css-style.js';
	import {
		createChangeEventDetails,
		REASONS,
		visuallyHidden,
		visuallyHiddenInput
	} from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { switchStateAttributesMapping } from './attributes.js';
	import { setSwitchContext } from './context.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { useFieldContext } from '../field/context.svelte.js';
	import { AriaLabelledBy, LabelableId, findLabelableContext } from '../field/labelable.svelte.js';
	import { useFormContext } from '../form/context.js';
	import type { SwitchHostProps, SwitchRootProps, SwitchRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();
	const field = useFieldContext();
	const formContext = useFormContext();
	const labelable = findLabelableContext();

	let {
		checked = $bindable(),
		defaultChecked = false,
		disabled: disabledProp = false,
		readonly: readOnly = false,
		required = false,
		nativeButton = false,
		name: nameProp,
		value,
		uncheckedValue,
		form,
		id,
		onCheckedChange,
		onclick,
		onfocus,
		onblur,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: SwitchRootProps = $props();

	// `defaultChecked` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (checked === undefined) checked = defaultChecked;

	// Two ids: the root's generated id, and the control id on the hidden input
	// (or on the root when nativeButton is set). An explicit id replaces the control id.
	const generatedRootId = $derived(`base-ui-${uid}`);
	const generatedControlId = $derived(`base-ui-${uid}` + '-control');
	const controlId = new LabelableId(labelable, {
		id: () => id,
		fallback: () => generatedControlId
	});
	const hiddenInputId = $derived(nativeButton ? undefined : controlId.current);
	const rootId = $derived(nativeButton ? controlId.current : generatedRootId);
	const disabled = $derived(field.disabled || disabledProp);
	const name = $derived(field.name ?? nameProp);

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

	let rootNode = $state<HTMLElement | null>(null);
	let inputNode = $state<HTMLInputElement | null>(null);
	const ariaLabelledBy = new AriaLabelledBy(labelable, {
		explicit: () => ariaLabelledByProp ?? undefined,
		input: () => (nativeButton ? null : inputNode),
		labelId: () => (hiddenInputId ? `${hiddenInputId}-label` : undefined)
	});
	const describedBy = $derived(labelable?.describedBy(ariaDescribedBy ?? undefined));
	const invalid = $derived(field.valid === false && !disabled);

	const fieldControl = attachFieldControl(field, {
		enabled: () => !disabled,
		id: () => generatedRootId,
		name: () => nameProp,
		getValue: () => checkedState
	});

	new FieldValueSync(field, formContext, {
		value: () => checkedState,
		name: () => name,
		filled: (value) => value
	});

	$effect(() => {
		const input = inputNode;
		const element = rootNode;
		if (!input) return;
		return field.registerInput(input, { element, value: undefined });
	});

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

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		const release = fieldControl(element);
		return () => {
			release?.();
			if (rootNode === element) rootNode = null;
		};
	}

	// A named checkbox uses absolute positioning so it stays associated with its
	// layout parent. An unnamed one uses the fixed visually-hidden style.
	const inputStyle = $derived(toCssStyle(name ? visuallyHiddenInput : visuallyHidden));
	let uncheckedNode = $state<HTMLInputElement | null>(null);

	// Chromium toggles a checkbox before dispatching click, then reverts the toggle
	// if the click is canceled. That is the same signal as the pinned React workaround
	// for https://github.com/react/react/issues/9023.
	function handleInputClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		event.stopPropagation();
		if (event.defaultPrevented || readOnly || disabled) {
			if (!event.defaultPrevented) event.preventDefault();
			return;
		}

		const nextChecked = event.currentTarget.checked;
		const details = createChangeEventDetails(REASONS.none, event);
		onCheckedChange?.(nextChecked, details);
		if (details.isCanceled) {
			event.preventDefault();
			return;
		}

		checked = nextChecked;
	}

	function handleInputFocus() {
		const node = rootNode;
		node?.focus();
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event);
		if (!disabled) field.setFocused(true);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onblur?.(event);
		const input = inputNode;
		if (!input || disabled) return;
		field.setTouched(true);
		field.setFocused(false);
		if (field.validationMode === 'onBlur') field.commit(input.checked);
	}

	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		// Keep a wrapping <label> from activating the hidden input a second time.
		event.preventDefault();
		if (inputNode) dispatchClick(inputNode, event);
	}

	const hostProps: SwitchHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy.current;
		return button.props({
			...getStateAttributesProps(switchState, switchStateAttributesMapping),
			id: rootId,
			role: 'switch',
			'aria-checked': checkedState,
			...(readOnly ? { 'aria-readonly': true as const } : {}),
			...(required ? { 'aria-required': true as const } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...(describedBy ? { 'aria-describedby': describedBy } : {}),
			...(invalid ? { 'aria-invalid': true as const } : {}),
			...elementProps,
			onclick: handleClick,
			onfocus: handleFocus,
			onblur: handleBlur,
			[rootKey]: registerRoot
		}) as SwitchHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, switchState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
<input
	bind:this={inputNode}
	type="checkbox"
	checked={checkedState}
	{defaultChecked}
	{disabled}
	{form}
	id={hiddenInputId}
	{name}
	{required}
	style={inputStyle}
	tabindex="-1"
	aria-hidden="true"
	aria-describedby={describedBy}
	aria-invalid={invalid || undefined}
	{...value !== undefined ? { value } : {}}
	onclick={handleInputClick}
	onfocus={handleInputFocus}
/>
{#if name && uncheckedValue !== undefined}
	<!-- Submits `uncheckedValue`. A native reset restores it with the checkbox above, so
	FormData never holds both values. -->
	<input
		bind:this={uncheckedNode}
		type="checkbox"
		hidden
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
