<!--
	A button that closes the popover. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/close/PopoverClose.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { buttonProps, guardDisabled, nonNativeKeys } from './button.js';
	import { useCloseParts, usePopoverRoot } from './context.svelte.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverCloseProps } from './types.js';

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

	function register(node: HTMLElement) {
		const stop = parts?.register();
		return () => {
			stop?.();
			void node;
		};
	}

	const hostProps = $derived(
		asHost<HTMLElement>(
			mergeProps(
				loose(elementProps),
				loose(guardDisabled(disabled)),
				loose({
					onclick(event: MouseEvent) {
						store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
					}
				}),
				loose(nonNativeKeys(disabled, nativeButton)),
				buttonProps(disabled, nativeButton),
				loose(disabled ? { 'data-disabled': '' } : {}),
				loose({ [bindKey]: register })
			)
		)
	);
</script>

{#if render}
	{@render render(hostProps, content)}
{:else}
	<button {...hostProps}>{@render content()}</button>
{/if}

{#snippet content()}
	{@render children?.()}
{/snippet}
