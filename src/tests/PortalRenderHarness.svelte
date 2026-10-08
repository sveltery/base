<script lang="ts">
	import { Dialog, Popover } from '#lib';

	let { part }: { part: 'dialog' | 'popover' } = $props();

	function mark(node: HTMLElement) {
		node.dataset.attached = 'yes';
		node.dataset.attachedInBody = node.parentElement === document.body ? 'yes' : 'no';
	}
</script>

{#if part === 'dialog'}
	<Dialog.Root defaultOpen>
		<Dialog.Portal data-slot="dialog-portal" class="portal-host" {@attach mark}>
			{#snippet render(props, _state, children)}
				<div {...props} data-replacement="">
					{@render children?.()}
				</div>
			{/snippet}
			<Dialog.Popup>Body</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<Popover.Root defaultOpen>
		<Popover.Portal data-slot="popover-portal" class="portal-host" {@attach mark}>
			{#snippet render(props, _state, children)}
				<div {...props} data-replacement="">
					{@render children?.()}
				</div>
			{/snippet}
			<Popover.Positioner>
				<Popover.Popup>Body</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/if}
