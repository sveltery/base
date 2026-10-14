<!--
	A Dialog or Popover trigger rendered through Toolbar.Button.
	`disabled` goes on the trigger so Toolbar.Button reads it from the spread props, as in real
	usage; an explicit `disabled` after the spread hides the aria-expanded regression.
	Derived from Base UI v1.9.0 packages/react/src/toolbar/button/ToolbarButton.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Dialog, Popover, Toolbar } from '#lib';

	let {
		kind,
		disabled,
		label,
		neighbor = false,
		onOpenChange
	}: {
		kind: 'dialog' | 'popover';
		disabled?: boolean;
		label?: string;
		neighbor?: boolean;
		onOpenChange?: (open: boolean, details: unknown) => void;
	} = $props();
</script>

{#snippet toolbarButton(
	props: HTMLButtonAttributes,
	_state: unknown,
	children: Snippet | undefined
)}
	<Toolbar.Button {...props}>{@render children?.()}</Toolbar.Button>
{/snippet}

<Toolbar.Root aria-label="Tools">
	{#if kind === 'dialog'}
		<Dialog.Root modal={false} {onOpenChange}>
			<Dialog.Trigger data-testid="trigger" {disabled} render={toolbarButton}
				>{label}</Dialog.Trigger
			>
			<Dialog.Portal>
				<Dialog.Backdrop />
				<Dialog.Popup>
					<Dialog.Title>title text</Dialog.Title>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	{:else}
		<Popover.Root {onOpenChange}>
			<Popover.Trigger data-testid="trigger" {disabled} render={toolbarButton}
				>{label}</Popover.Trigger
			>
			<Popover.Portal>
				<Popover.Positioner>
					<Popover.Popup>Content</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	{/if}
	{#if neighbor}
		<Toolbar.Button>empty</Toolbar.Button>
	{/if}
</Toolbar.Root>
