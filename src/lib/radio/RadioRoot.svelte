<!--
	Represents the radio button itself. Renders a `<span>` and a hidden radio beside it.
	Derived from Base UI v1.8.0 packages/react/src/radio/root/RadioRoot.tsx,
	the non-composite paths of packages/react/src/internals/use-button/useButton.ts,
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, validation, and Form error clearing are not ported.
	An optional group context supplies the shared value. When that context includes
	roving focus, this root registers as a composite item.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { visuallyHidden, visuallyHiddenInput } from '../internal/visuallyHidden.js';
	import { radioRootAttributes } from './attributes.js';
	import { setRadioContext } from './context.js';
	import { useRadioGroupContext } from './group-context.js';
	import { findAssociatedLabel } from './label.js';
	import { serializeValue } from './serialize-value.js';
	import type { RadioHostProps, RadioRootProps, RadioRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();
	const group = useRadioGroupContext();
	const slot = group?.roving?.claim() ?? 0;

	let {
		value,
		disabled: disabledProp = false,
		readOnly: readOnlyProp = false,
		required: requiredProp = false,
		nativeButton = false,
		id,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		onfocus,
		'aria-labelledby': ariaLabelledBy,
		render,
		children,
		...elementProps
	}: RadioRootProps = $props();

	const generatedRootId = $derived(`base-ui-${uid}`);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	const controlId = $derived(id ?? generatedControlId);
	const hiddenInputId = $derived(nativeButton ? undefined : controlId);
	const rootId = $derived(nativeButton ? controlId : generatedRootId);

	const checked = $derived(group !== undefined ? group.checkedValue === value : value === '');
	const disabled = $derived(Boolean(group?.disabled) || disabledProp);
	const readOnly = $derived(Boolean(group?.readOnly) || readOnlyProp);
	const required = $derived(Boolean(group?.required) || requiredProp);
	const fieldName = $derived(group?.name);
	const fieldForm = $derived(group?.form);

	const radioState: RadioRootState = $derived({
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
	let fallbackLabelId = $state<string | undefined>(undefined);
	// The click that checks the input. React's radio `onChange` is that click,
	// so modifier keys on the activation are visible to `onValueChange`.
	let activationEvent: Event | undefined;

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		const remove = group?.roving?.register(element);
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

	$effect(() => {
		const register = group?.registerInput;
		const input = inputNode;
		if (!register || !input) return;
		if (disabled && checked) return register(null);
		return register(input);
	});

	function handleInputClick(event: MouseEvent) {
		// Clicks dispatched on the input from the root and from focus are an
		// implementation detail and must not reach ancestors.
		event.stopPropagation();
		activationEvent = event;
		queueMicrotask(() => {
			if (activationEvent === event) activationEvent = undefined;
		});
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
		if (details.isCanceled) {
			syncInput();
			return;
		}

		syncInput();
	}

	function handleInputFocus() {
		rootNode?.focus();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) {
			event.preventDefault();
			return;
		}

		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		event.preventDefault();
		if (!inputNode) return;
		dispatchClick(inputNode, event);
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (!disabled) onmousedown?.(event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onpointerdown?.(event);
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

	function currentHost(event: Event): HTMLElement | null {
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement) || event.target !== current) return null;
		return current;
	}

	function isLink(element: HTMLElement) {
		return !nativeButton && element instanceof HTMLAnchorElement && Boolean(element.href);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) return;

		onkeydown?.(event);
		// Radio only activates with Space. Preventing Enter stops it becoming a click.
		if (event.key === 'Enter') event.preventDefault();

		const current = currentHost(event);
		if (!current) return;

		const buttonElement = current instanceof HTMLButtonElement;
		const link = isLink(current);
		const shouldClick = nativeButton ? buttonElement : !link;
		const isSpace = event.key === ' ';
		const isEnter = event.key === 'Enter';

		if (!shouldClick || nativeButton || (!isSpace && !isEnter)) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		if (event.defaultPrevented) return;

		event.preventDefault();
		if (isEnter) dispatchClick(current, event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) return;

		onkeyup?.(event);
		if (event.defaultPrevented || nativeButton || event.key !== ' ') return;

		const current = currentHost(event);
		if (!current) return;
		dispatchClick(current, event);
	}

	$effect(() => {
		if (nativeButton || ariaLabelledBy) {
			fallbackLabelId = undefined;
			return;
		}

		const input = inputNode;
		const sourceId = hiddenInputId;
		if (!input) {
			fallbackLabelId = undefined;
			return;
		}

		const label = findAssociatedLabel(input);
		if (!label) {
			fallbackLabelId = undefined;
			return;
		}

		if (!label.id && sourceId) label.id = `${sourceId}-label`;
		fallbackLabelId = label.id || undefined;
	});

	const hostProps: RadioHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy ?? fallbackLabelId;
		return {
			...radioRootAttributes(radioState),
			...(nativeButton ? { type: 'button' as const } : {}),
			tabindex: group?.roving
				? group.roving.tabIndex(slot, rootNode, checked, group.checkedValue !== undefined)
				: !nativeButton && disabled
					? -1
					: 0,
			...(!nativeButton && disabled ? { 'aria-disabled': true as const } : {}),
			...(nativeButton && disabled ? { disabled: true } : {}),
			id: rootId,
			role: 'radio',
			'aria-checked': checked,
			...(checked ? { 'data-composite-item-active': '' } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...elementProps,
			onclick: handleClick,
			onmousedown: handleMouseDown,
			onpointerdown: handlePointerDown,
			onkeydown: handleKeyDown,
			onkeyup: handleKeyUp,
			onfocus: handleFocus,
			[rootKey]: registerRoot
		};
	});

	function dispatchClick(target: HTMLElement, source: MouseEvent | KeyboardEvent) {
		const view = target.ownerDocument.defaultView ?? window;
		target.dispatchEvent(
			new view.PointerEvent('click', {
				bubbles: true,
				cancelable: true,
				composed: true,
				detail: 0,
				shiftKey: source.shiftKey,
				ctrlKey: source.ctrlKey,
				altKey: source.altKey,
				metaKey: source.metaKey
			})
		);
	}

	function toCssStyle(style: Record<string, string | number>): string {
		return Object.entries(style)
			.map(([key, declaration]) => {
				const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
				return `${property}: ${declaration}`;
			})
			.join('; ');
	}
</script>

{#if render}
	{@render render(hostProps, radioState)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
<input
	bind:this={inputNode}
	type="radio"
	{checked}
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
