<!--
	Represents the radio button itself. Renders a `<span>` and a hidden radio beside it.
	Derived from Base UI v1.8.0 packages/react/src/radio/root/RadioRoot.tsx
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	An optional group context supplies the shared value. When that context includes
	roving focus, this root registers as a composite item.
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
	import { radioRootAttributes } from './attributes.js';
	import { setRadioContext } from './context.js';
	import { useRadioGroupContext } from './group-context.js';
	import { useFieldContext, useFieldItemContext } from '../field/context.svelte.js';
	import { AriaLabelledBy, LabelableId, findLabelableContext } from '../field/labelable.svelte.js';
	import { serializeValue } from './serialize-value.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import type { RadioHostProps, RadioRootProps, RadioRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();
	const group = useRadioGroupContext();
	const field = useFieldContext();
	const fieldItem = useFieldItemContext();
	const labelable = findLabelableContext();
	const renderIndex = group?.roving ? group.roving.claim() : 0;

	let {
		value,
		disabled: disabledProp = false,
		readonly: readOnlyProp = false,
		required: requiredProp = false,
		nativeButton = false,
		id,
		onclick,
		onkeydown,
		onfocus,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: RadioRootProps = $props();

	const generatedRootId = $derived(`base-ui-${uid}`);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	// Radios that share their group's labelable scope leave the Field's id to the group.
	const controlId = new LabelableId(labelable, {
		id: () => id,
		fallback: () => generatedControlId,
		enabled: () => !group || group.labelable !== labelable
	});
	const hiddenInputId = $derived(nativeButton ? undefined : controlId.current);
	const rootId = $derived(nativeButton ? controlId.current : generatedRootId);

	const checked = $derived(group !== undefined ? group.checkedValue === value : value === '');
	const disabled = $derived(
		field.disabled || fieldItem.disabled || Boolean(group?.disabled) || disabledProp
	);
	const readOnly = $derived(Boolean(group?.readOnly) || readOnlyProp);
	const required = $derived(Boolean(group?.required) || requiredProp);
	const fieldName = $derived(group?.name);
	const fieldForm = $derived(group?.form);

	const radioState: RadioRootState = $derived({
		...field.state,
		checked,
		disabled,
		readOnly,
		required
	});

	setRadioContext({
		get checked() {
			return checked;
		},
		get disabled() {
			return disabled;
		},
		get readOnly() {
			return readOnly;
		},
		get required() {
			return required;
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
	const invalid = $derived(group !== undefined && field.valid === false && !disabled);

	// The group is the field's control. Each radio input joins its validity.
	$effect(() => {
		const input = inputNode;
		const element = rootNode;
		if (!input || !group) return;
		return field.registerInput(input, { element, value: undefined });
	});
	// The click that checks the input. React's radio `onChange` is that click,
	// so modifier keys on the activation are visible to `onValueChange`.
	let activationEvent: Event | undefined;

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		const remove = group?.roving?.register(element, () => ({ value, disabled }));
		return () => {
			remove?.();
			if (rootNode === element) rootNode = null;
		};
	}

	const inputStyle = $derived(toCssStyle(fieldName ? visuallyHiddenInput : visuallyHidden));
	const serialized = $derived(value !== undefined ? serializeValue(value) : undefined);

	function selectedNow() {
		return group !== undefined ? group.checkedValue === value : value === '';
	}

	function syncInput() {
		const input = inputNode;
		if (!input) return;
		const next = selectedNow();
		if (input.checked !== next) input.checked = next;
	}

	$effect(() => {
		const input = inputNode;
		const next = checked;
		if (!input) return;
		input.checked = next;
	});

	// The group restores its value. This catches a selection the owner kept.
	restoreOnReset(() => inputNode, syncInput, 'settle');

	function handleInputClick(event: MouseEvent) {
		// Clicks dispatched on the input from the root and from focus are an
		// implementation detail and must not reach ancestors.
		event.stopPropagation();
		activationEvent = event;
	}

	function handleInputChange(event: Event) {
		const source = activationEvent ?? event;
		activationEvent = undefined;
		if (event.defaultPrevented || disabled || readOnly || value === undefined) {
			syncInput();
			return;
		}

		const details = createChangeEventDetails(REASONS.none, source);
		group?.setCheckedValue(value, details);
		if (!details.isCanceled) field.setTouched(true);
		syncInput();
	}

	function handleInputFocus() {
		rootNode?.focus();
	}

	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		event.preventDefault();
		if (!inputNode) return;
		dispatchClick(inputNode, event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event);
		if (event.currentTarget instanceof HTMLElement) group?.roving?.highlight(event.currentTarget);
		// Read the group's touched flag live. Arrow keys set it in the capture
		// phase of this same turn, before a derived value would refresh.
		if (event.defaultPrevented || disabled || readOnly || !group?.touched) return;
		inputNode?.click();
		group?.setTouched(false);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		onkeydown?.(event);
		// Radio only activates with Space. Enter never becomes a click.
		if (event.key === 'Enter') event.preventDefault();
	}

	const hostProps: RadioHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy.current;
		return button.props({
			...radioRootAttributes(radioState),
			...(group?.roving
				? {
						tabindex: group.roving.tabIndex(rootNode, renderIndex, {
							disabled,
							selected: checked,
							hasSelection: group.checkedValue !== undefined
						})
					}
				: {}),
			id: rootId,
			role: 'radio',
			'aria-checked': checked,
			...(checked ? { 'data-composite-item-active': '' } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...(describedBy ? { 'aria-describedby': describedBy } : {}),
			...(invalid ? { 'aria-invalid': true as const } : {}),
			...elementProps,
			onclick: handleClick,
			onkeydown: handleKeyDown,
			onfocus: handleFocus,
			[rootKey]: registerRoot
		}) as RadioHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, radioState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
<input
	bind:this={inputNode}
	type="radio"
	{checked}
	defaultChecked={group !== undefined && value !== undefined && group.defaultValue === value}
	{disabled}
	form={fieldForm}
	id={hiddenInputId}
	name={fieldName}
	readonly={readOnly}
	{required}
	style={inputStyle}
	tabindex="-1"
	aria-hidden="true"
	{...serialized !== undefined ? { value: serialized } : {}}
	onclick={handleInputClick}
	onchange={handleInputChange}
	onfocus={handleInputFocus}
/>
