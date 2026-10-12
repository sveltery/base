<!--
	Represents the switch itself. Renders a `<span>` and a hidden checkbox beside it.
	Derived from Base UI v1.8.0 packages/react/src/switch/root/SwitchRoot.tsx
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, validation, and Form error clearing are not ported.
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
	import { nativeFallbackLabelId } from '../internal/associated-label.js';
	import type { SwitchHostProps, SwitchRootProps, SwitchRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();

	let {
		checked = $bindable(),
		defaultChecked = false,
		disabled = false,
		readonly: readOnly = false,
		required = false,
		nativeButton = false,
		name,
		value,
		uncheckedValue,
		form,
		id,
		onCheckedChange,
		onclick,
		'aria-labelledby': ariaLabelledBy,
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
	const controlId = $derived(id ?? generatedControlId);
	const hiddenInputId = $derived(nativeButton ? undefined : controlId);
	const rootId = $derived(nativeButton ? controlId : generatedRootId);

	const checkedState = $derived(checked === true);
	const switchState: SwitchRootState = $derived({
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
	const showUnchecked = $derived(!checkedState && Boolean(name) && uncheckedValue !== undefined);

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

	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		// Keep a wrapping <label> from activating the hidden input a second time.
		event.preventDefault();
		if (inputNode) dispatchClick(inputNode, event);
	}

	// Client-only: a sibling or wrapping <label> is not known during SSR.
	$effect(() => {
		// Assigns an id on the native label when it has none. That write has to stay in an effect.
		const id = nativeFallbackLabelId(nativeButton, ariaLabelledBy, inputNode, hiddenInputId);
		fallbackLabelId = id;
	});

	const hostProps: SwitchHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy ?? fallbackLabelId;
		return button.props({
			...getStateAttributesProps(switchState, switchStateAttributesMapping),
			id: rootId,
			role: 'switch',
			'aria-checked': checkedState,
			...(readOnly ? { 'aria-readonly': true as const } : {}),
			...(required ? { 'aria-required': true as const } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...elementProps,
			onclick: handleClick,
			[rootKey]: registerRoot
		}) as SwitchHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, switchState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
{#if showUnchecked}
	<input type="hidden" {form} {name} value={uncheckedValue} {disabled} />
{/if}
<input
	bind:this={inputNode}
	type="checkbox"
	checked={checkedState}
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
