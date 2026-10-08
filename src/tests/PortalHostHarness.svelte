<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part }: { part: 'dialog' | 'popover' } = $props();

	function mark(node: HTMLElement) {
		node.dataset.attached = 'yes';
	}
</script>

{#if part === 'dialog'}
	<Dialog.Root defaultOpen>
		<Dialog.Portal
			data-slot="dialog-portal"
			class="portal-host"
			data-probe="probe"
			data-base-ui-portal="overridden"
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
			{@attach mark}
		>
			<Popover.Positioner>
				<Popover.Popup>Body</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/if}
