<!--
	A button that closes the popover. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/popover/close/PopoverClose.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
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
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	function register() {
		return parts?.register();
	}

	const hostProps = $derived(
		mergeProps(
			{ [bindKey]: register },
			disabled ? { 'data-disabled': '' } : {},
			button.props(
				mergeProps(
					{
						onclick(event: MouseEvent) {
							store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
						}
					},
					elementProps
				)
			)
		)
	);
	const state: PopoverCloseState = {};
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
