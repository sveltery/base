<!--
	A button that opens and closes the corresponding panel. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/trigger/AccordionTrigger.tsx
	and the non-composite path of packages/react/src/internals/use-button/useButton.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { currentHost, dispatchClick, isLink } from '../internal/click.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../collapsible/attributes.js';
	import { useCollapsibleRootContext } from '../collapsible/context.svelte.js';
	import { useAccordionItemContext } from './context.svelte.js';
	import type { AccordionTriggerHostProps, AccordionTriggerProps } from './types.js';

	let {
		disabled: disabledProp,
		id,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		render,
		children,
		...elementProps
	}: AccordionTriggerProps = $props();

	const root = useCollapsibleRootContext();
	const item = useAccordionItemContext();
	const disabled = $derived(Boolean(disabledProp) || root.disabled);
	const state = $derived(item.state);
	const registeredId = $derived(id ? id : undefined);

	$effect(() => {
		const current = registeredId;
		item.registerTrigger(current);
		return () => item.unregisterTrigger(current);
	});

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
		if (disabled) {
			if (event.key !== 'Tab') event.preventDefault();
			return;
		}

		onkeydown?.(event);
		if (nativeButton || event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const link = isLink(current, nativeButton);
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

	const hostProps: AccordionTriggerHostProps = $derived.by(() => {
		const props = {
			...(nativeButton ? { type: 'button' as const } : { role: 'button' as const }),
			tabindex: 0,
			id: registeredId ?? item.defaultTriggerId,
			'aria-expanded': root.open,
			...(root.open && root.panelId ? { 'aria-controls': root.panelId } : {}),
			...(disabled ? { 'aria-disabled': true } : {}),
			...elementProps,
			...getStateAttributesProps(state, triggerOpenStateMapping),
			onclick: handleClick,
			onmousedown: handleMouseDown,
			onpointerdown: handlePointerDown,
			onkeydown: handleKeyDown,
			onkeyup: handleKeyUp
		};
		return props as AccordionTriggerHostProps;
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
