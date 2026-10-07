<!--
	Represents the checkbox itself. Renders a `<span>` and a hidden checkbox beside it.
	Derived from Base UI v1.8.0 packages/react/src/checkbox/root/CheckboxRoot.tsx,
	the non-composite paths of packages/react/src/internals/use-button/useButton.ts,
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, validation, Form error clearing, and CheckboxGroup are not ported.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { visuallyHidden, visuallyHiddenInput } from '../internal/visuallyHidden.js';
	import { checkboxRootAttributes } from './attributes.js';
	import { setCheckboxContext } from './context.js';
	import { findAssociatedLabel } from './label.js';
	import { getDefaultFormSubmitter } from './submitter.js';
	import type { CheckboxHostProps, CheckboxRootProps, CheckboxRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();

	let {
		checked = $bindable(false),
		disabled = false,
		readOnly = false,
		required = false,
		indeterminate = false,
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
	}: CheckboxRootProps = $props();

	const generatedRootId = $derived(`base-ui-${uid}`);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	const controlId = $derived(id ?? generatedControlId);
	const hiddenInputId = $derived(nativeButton ? undefined : controlId);
	const rootId = $derived(nativeButton ? controlId : generatedRootId);

	const checkboxState: CheckboxRootState = $derived({
		checked,
		disabled,
		readOnly,
		required,
		indeterminate
	});

	setCheckboxContext({
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
		},
		get indeterminate() {
			return indeterminate;
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

	const inputStyle = $derived(toCssStyle(name ? visuallyHiddenInput : visuallyHidden));
	const showUnchecked = $derived(!checked && Boolean(name) && uncheckedValue !== undefined);

	// A click clears `indeterminate` before the listener runs. Put it back after `checked` updates.
	$effect(() => {
		const input = inputNode;
		if (!input) return;
		void checked;
		input.indeterminate = indeterminate;
	});

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

		// Enter does not tick the checkbox. It submits the form unless a later listener cancels it.
		if (event.key === 'Enter') {
			if (event.defaultPrevented) return;
			const host = event.currentTarget;
			const formToSubmit = inputNode?.form ?? null;
			let preventedAfter = false;
			const originalPreventDefault = event.preventDefault.bind(event);
			event.preventDefault = () => {
				preventedAfter = true;
				originalPreventDefault();
			};
			originalPreventDefault();
			const view = host.ownerDocument.defaultView ?? window;
			view.queueMicrotask(() => {
				event.preventDefault = originalPreventDefault;
				if (!preventedAfter) getDefaultFormSubmitter(formToSubmit)?.click();
			});
			return;
		}

		if (event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const buttonElement = current instanceof HTMLButtonElement;
		const link = isLink(current);
		const shouldClick = nativeButton ? buttonElement : !link;
		const isSpace = event.key === ' ';

		if (!shouldClick || nativeButton || !isSpace) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
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

	const hostProps: CheckboxHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy ?? fallbackLabelId;
		return {
			...checkboxRootAttributes(checkboxState),
			...(nativeButton ? { type: 'button' as const } : {}),
			tabindex: !nativeButton && disabled ? -1 : 0,
			...(!nativeButton && disabled ? { 'aria-disabled': true as const } : {}),
			...(nativeButton && disabled ? { disabled: true } : {}),
			id: rootId,
			role: 'checkbox',
			'aria-checked': indeterminate ? 'mixed' : checked,
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
	{@render render(hostProps, checkboxState)}
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
