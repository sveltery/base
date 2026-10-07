<!--
	Represents the switch itself. Renders a `<span>` and a hidden checkbox beside it.
	Derived from Base UI v1.8.0 packages/react/src/switch/root/SwitchRoot.tsx,
	the non-composite paths of packages/react/src/internals/use-button/useButton.ts,
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, validation, and Form error clearing are not ported.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { currentHost, dispatchClick, isLink } from '../internal/click.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { visuallyHidden, visuallyHiddenInput } from '../internal/visuallyHidden.js';
	import { switchStateAttributesMapping } from './attributes.js';
	import { setSwitchContext } from './context.js';
	import { findAssociatedLabel } from '../internal/associated-label.js';
	import type { SwitchHostProps, SwitchRootProps, SwitchRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();

	let {
		checked = $bindable(false),
		disabled = false,
		readOnly = false,
		required = false,
		nativeButton = false,
		name,
		value,
		uncheckedValue,
		form,
		id,
		onCheckedChange,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		'aria-labelledby': ariaLabelledBy,
		render,
		children,
		...elementProps
	}: SwitchRootProps = $props();

	// Two ids: the root's generated id, and the control id on the hidden input
	// (or on the root when nativeButton is set). An explicit id replaces the control id.
	const generatedRootId = $derived(`base-ui-${uid}`);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	const controlId = $derived(id ?? generatedControlId);
	const hiddenInputId = $derived(nativeButton ? undefined : controlId);
	const rootId = $derived(nativeButton ? controlId : generatedRootId);

	const switchState: SwitchRootState = $derived({ checked, disabled, readOnly, required });

	setSwitchContext({
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

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		return () => {
			if (rootNode === element) rootNode = null;
		};
	}

	// A named checkbox uses absolute positioning so it stays associated with its
	// layout parent. An unnamed one uses the fixed visually-hidden style.
	const inputStyle = $derived(toCssStyle(name ? visuallyHiddenInput : visuallyHidden));
	const showUnchecked = $derived(!checked && Boolean(name) && uncheckedValue !== undefined);

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
		rootNode?.focus();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) {
			event.preventDefault();
			return;
		}

		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		// Keep a wrapping <label> from activating the hidden input a second time.
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

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) return;

		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const buttonElement = current instanceof HTMLButtonElement;
		const link = isLink(current, nativeButton);
		const shouldClick = nativeButton ? buttonElement : !link;
		const isEnter = event.key === 'Enter';
		const isSpace = event.key === ' ';

		// Native buttons activate themselves. Links keep Enter and only suppress Space scrolling.
		if (!shouldClick || nativeButton || (!isSpace && !isEnter)) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
		if (isEnter) dispatchClick(current, event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) return;

		onkeyup?.(event);
		// A prevented Space keydown still clicks on keyup unless this keyup is prevented.
		if (event.defaultPrevented || nativeButton || event.key !== ' ') return;

		const current = currentHost(event);
		if (!current) return;
		dispatchClick(current, event);
	}

	// Client-only: a sibling or wrapping <label> is not known during SSR.
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

	const hostProps: SwitchHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy ?? fallbackLabelId;
		return {
			...getStateAttributesProps(switchState, switchStateAttributesMapping),
			...(nativeButton ? { type: 'button' as const } : {}),
			tabindex: !nativeButton && disabled ? -1 : 0,
			...(!nativeButton && disabled ? { 'aria-disabled': true as const } : {}),
			...(nativeButton && disabled ? { disabled: true } : {}),
			id: rootId,
			role: 'switch',
			'aria-checked': checked,
			...(readOnly ? { 'aria-readonly': true as const } : {}),
			...(required ? { 'aria-required': true as const } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...elementProps,
			onclick: handleClick,
			onmousedown: handleMouseDown,
			onpointerdown: handlePointerDown,
			onkeydown: handleKeyDown,
			onkeyup: handleKeyUp,
			[rootKey]: registerRoot
		};
	});
</script>

{#if render}
	{@render render(hostProps, switchState)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
{#if showUnchecked}
	<input type="hidden" {form} {name} value={uncheckedValue} {disabled} />
{/if}
<input
	bind:this={inputNode}
	type="checkbox"
	{checked}
	{disabled}
	{form}
	id={hiddenInputId}
	{name}
	{required}
	style={inputStyle}
	tabindex="-1"
	aria-hidden="true"
	{...value !== undefined ? { value } : {}}
	onclick={handleInputClick}
	onfocus={handleInputFocus}
/>
