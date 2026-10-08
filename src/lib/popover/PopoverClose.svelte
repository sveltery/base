<!--
	A button that closes the popover. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/close/PopoverClose.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import PartHost from '../internal/PartHost.svelte';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { useButton } from '../internal/useButton.js';
	import { useCloseParts, usePopoverRoot } from './context.svelte.js';
	import type { PopoverCloseProps, PopoverCloseState } from './types.js';

	let {
		disabled = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: PopoverCloseProps = $props();

	const store = usePopoverRoot();
	const parts = useCloseParts();
	const bindKey = createAttachmentKey();

	function register() {
		return parts?.register();
	}

	const hostProps = $derived(
		mergeProps(
			{ [bindKey]: register },
			disabled ? { 'data-disabled': '' } : {},
			useButton(disabled, nativeButton),
			{
				onclick(event: MouseEvent) {
					store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
				}
			},
			elementProps
		)
	);
	const state: PopoverCloseState = {};
</script>

<PartHost tag="button" {render} {children} elementProps={hostProps} partState={state} />
