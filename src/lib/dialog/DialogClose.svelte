<!--
	A button that closes the dialog. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/close/DialogClose.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/Button.svelte';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useDialogRootContext } from './context.svelte.js';
	import type { DialogCloseProps, DialogCloseState } from './types.js';

	let {
		disabled = false,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		render,
		children,
		...elementProps
	}: DialogCloseProps = $props();

	const store = useDialogRootContext();
	const state: DialogCloseState = $derived({ disabled });

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented || !store.open) return;
		store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
	}

	const described = $derived({
		...elementProps,
		...getStateAttributesProps(state)
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#snippet host(props: HTMLAttributes<HTMLElement>, _buttonState: { disabled: boolean })}
	{#if render}
		{@render render(props, state, content)}
	{:else}
		<button {...props}>{@render content()}</button>
	{/if}
{/snippet}

<Button
	{disabled}
	{nativeButton}
	onclick={handleClick}
	{onmousedown}
	{onpointerdown}
	{onkeydown}
	{onkeyup}
	render={host}
	{...described}
/>
