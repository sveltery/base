<script lang="ts">
	import { Dialog, Popover } from '#lib';
	import type { DialogPortalProps } from '../lib/dialog/types.js';
	import type { PopoverPortalProps } from '../lib/popover/types.js';

	let {
		part,
		stray = undefined
	}: {
		part: 'dialog' | 'popover';
		stray?: { portalElement: HTMLElement | null };
	} = $props();

	function mark(node: HTMLElement) {
		node.dataset.attached = 'yes';
		node.dataset.attachedInBody = node.parentElement === document.body ? 'yes' : 'no';
	}

	const dialogStray = $derived((stray ? { store: stray } : {}) as DialogPortalProps);
	const popoverStray = $derived((stray ? { store: stray } : {}) as PopoverPortalProps);
</script>

{#if part === 'dialog'}
	<Dialog.Root defaultOpen>
		<Dialog.Portal
			data-slot="dialog-portal"
			class="portal-host"
			data-probe="probe"
			data-base-ui-portal="overridden"
			{...dialogStray}
			{@attach mark}
		>
			<Dialog.Popup>Body</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<Popover.Root defaultOpen>
		<Popover.Portal
			data-slot="popover-portal"
			class="portal-host"
			data-probe="probe"
			data-base-ui-portal="overridden"
			{...popoverStray}
			{@attach mark}
		>
			<Popover.Positioner>
				<Popover.Popup>Body</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/if}
