<!--
	A button that opens and closes the collapsible panel. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/trigger/CollapsibleTrigger.tsx
	and the non-composite path of packages/react/src/internals/use-button/useButton.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerStateAttributesMapping } from './attributes.js';
	import { useCollapsibleRootContext } from './context.svelte.js';
	import type { CollapsibleTriggerHostProps, CollapsibleTriggerProps } from './types.js';

	let {
		disabled: disabledProp,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		render,
		children,
		...elementProps
	}: CollapsibleTriggerProps = $props();

	const root = useCollapsibleRootContext();
	const disabled = $derived(disabledProp ?? root.disabled);
	const state = $derived(root.state);

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

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
		if (event.defaultPrevented) return;
		root.handleTrigger(event);
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
		// A disabled trigger stays tabbable. Blocking other keys stops native activation.
		if (disabled) {
			if (event.key !== 'Tab') event.preventDefault();
			return;
		}

		onkeydown?.(event);
		if (nativeButton || event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const link = isLink(current);
		const shouldClick = !link;
		const isEnter = event.key === 'Enter';
		const isSpace = event.key === ' ';

		if (!shouldClick || (!isSpace && !isEnter)) {
			if (link && isSpace) event.preventDefault();
			return;
		}

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

	const hostProps: CollapsibleTriggerHostProps = $derived.by(() => {
		const props = {
			...(nativeButton ? { type: 'button' as const } : { role: 'button' as const }),
			tabindex: 0,
			'aria-expanded': root.open,
			...(root.open && root.panelId ? { 'aria-controls': root.panelId } : {}),
			...(disabled ? { 'aria-disabled': true } : {}),
			...elementProps,
			...getStateAttributesProps(state, triggerStateAttributesMapping),
			onclick: handleClick,
			onmousedown: handleMouseDown,
			onpointerdown: handlePointerDown,
			onkeydown: handleKeyDown,
			onkeyup: handleKeyUp
		};
		return props as CollapsibleTriggerHostProps;
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<button {...hostProps}>{@render content()}</button>
{/if}
