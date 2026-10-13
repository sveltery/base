<!--
	A button that closes the dialog. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/dialog/close/DialogClose.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
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
