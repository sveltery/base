<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import type { Attachment } from 'svelte/attachments';

	function animateOpen(open: boolean): Attachment<HTMLElement> {
		return (element) => {
			// Starting from the current values lets a reopen reverse a closing animation midway.
			const { opacity, scale } = getComputedStyle(element);
			element.animate(
				[
					{ opacity, scale },
					{ opacity: open ? 1 : 0, scale: open ? 1 : 0.8 }
				],
				{ duration: 200, easing: 'ease-out', fill: 'forwards' }
			);
		};
	}
</script>

<Popover.Root>
	<Popover.Trigger
		class="flex h-8 items-center justify-center border border-neutral-950 bg-white px-3 text-sm font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white"
	>
		Trigger
	</Popover.Trigger>
	<Popover.Portal keepMounted>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup
				class="box-border max-w-[500px] origin-[var(--transform-origin)] border border-neutral-950 bg-white px-4 py-3 text-sm text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				{#snippet render(props, state, children)}
					<div {...props} {@attach animateOpen(state.open)}>
						{@render children?.()}
					</div>
				{/snippet}
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
