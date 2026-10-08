<!--
	A button that closes the dialog. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/close/DialogClose.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import DialogAction from './DialogAction.svelte';
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
	const state: DialogCloseState = $derived({ disabled: disabled === true });

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented || !store.open) return;
		store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
	}

	const described = $derived({
		...elementProps,
		...getStateAttributesProps(state)
	});
</script>

<DialogAction
	{disabled}
	{nativeButton}
	onclick={handleClick}
	{onmousedown}
	{onpointerdown}
	{onkeydown}
	{onkeyup}
	{render}
	{state}
	{children}
	{described}
/>
