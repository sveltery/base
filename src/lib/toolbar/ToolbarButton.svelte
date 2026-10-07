<!--
	A button in a toolbar. Renders a `<button>`.
	Derived from Base UI v1.8.0 packages/react/src/toolbar/button/ToolbarButton.tsx,
	the composite path of packages/react/src/internals/use-button/useButton.ts,
	and packages/react/src/utils/useFocusableWhenDisabled.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Toolbar buttons are composite items: Space activates on keydown so a native
	button does not also click on keyup.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToolbarGroupContext, useToolbarRootContext } from './context.svelte.js';
	import type { ToolbarButtonHostProps, ToolbarButtonProps, ToolbarButtonState } from './types.js';

	const toolbar = useToolbarRootContext();
	const group = useToolbarGroupContext();
	const slot = toolbar.roving.claim();

	let {
		disabled = false,
		focusableWhenDisabled = true,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		onfocus,
		render,
		children,
		...elementProps
	}: ToolbarButtonProps = $props();

	const disabledState = $derived(toolbar.disabled || (group?.disabled ?? false) || disabled);
	const buttonState: ToolbarButtonState = $derived({
		disabled: disabledState,
		orientation: toolbar.orientation,
		focusable: focusableWhenDisabled
	});

	let node: HTMLElement | null = $state(null);

	function register(element: HTMLElement) {
		node = element;
		const remove = toolbar.roving.register(element);
		return () => {
			remove();
			if (node === element) node = null;
		};
	}

	$effect(() => {
		void disabledState;
		void focusableWhenDisabled;
		toolbar.roving.sync();
	});

	// Untrusted constructed clicks carry modifier state. detail 0 matches a keyboard click.
	// Same algorithm as the pinned helper.
	function dispatchClick(target: HTMLElement, source: KeyboardEvent) {
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

	function currentHost(event: Event): HTMLElement | null {
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement) || event.target !== current) return null;
		return current;
	}

	function isLink(element: HTMLElement) {
		return !nativeButton && element instanceof HTMLAnchorElement && Boolean(element.href);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event as FocusEvent & { currentTarget: EventTarget & HTMLButtonElement });
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (disabledState) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
	}

	// Pinned behavior: a disabled mousedown does not cancel its default.
	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!disabledState) onmousedown?.(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (disabledState) {
			event.preventDefault();
			return;
		}
		onpointerdown?.(event);
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (disabledState) {
			// Let Tab leave. Block every other key's default, including arrows.
			// Arrows still move: the toolbar root handles them and ignores this preventDefault.
			if (focusableWhenDisabled && event.key !== 'Tab') event.preventDefault();
			return;
		}

		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const buttonElement = current instanceof HTMLButtonElement;
		const link = isLink(current);
		const isEnter = event.key === 'Enter';
		const isSpace = event.key === ' ';

		// Composite items click on Space keydown. preventDefault stops a native button
		// from clicking again on keyup.
		if (isSpace) {
			event.preventDefault();
			if (!nativeButton || buttonElement) dispatchClick(current, event);
			return;
		}

		const shouldClick = nativeButton ? buttonElement : !link;
		if (!shouldClick || nativeButton || !isEnter) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
		dispatchClick(current, event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (disabledState) return;

		onkeyup?.(event);
		if (event.defaultPrevented || event.key !== ' ') return;

		// The keydown already clicked. Swallow the native Space keyup as well.
		if (nativeButton && event.currentTarget instanceof HTMLButtonElement) {
			event.preventDefault();
		}
	}

	const hostProps: ToolbarButtonHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(
		() => {
			const roving = toolbar.roving.item(slot, node, register, { onfocus: handleFocus });
			const attachmentKey = toolbar.roving.keyForAttachment();
			return {
				...(nativeButton ? { type: 'button' as const } : { role: 'button' as const }),
				...((nativeButton && focusableWhenDisabled) || (!nativeButton && disabledState)
					? { 'aria-disabled': disabledState }
					: {}),
				...(nativeButton && !focusableWhenDisabled && disabledState ? { disabled: true } : {}),
				...elementProps,
				...getStateAttributesProps(buttonState),
				tabindex: roving.tabindex,
				onclick: handleClick,
				onmousedown: handleMouseDown,
				onpointerdown: handlePointerDown,
				onkeydown: handleKeyDown,
				onkeyup: handleKeyUp,
				onfocus: roving.onfocus,
				[attachmentKey]: roving[attachmentKey]
			} as ToolbarButtonHostProps & Record<symbol, Attachment<HTMLElement>>;
		}
	);
</script>

{#if render}
	{@render render(hostProps, buttonState)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
