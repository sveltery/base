<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import type { Attachment } from 'svelte/attachments';
	import styles from './index.module.css';

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
	<Popover.Trigger class={styles.Trigger}>Trigger</Popover.Trigger>
	<Popover.Portal keepMounted>
		<Popover.Positioner class={styles.Positioner} sideOffset={8}>
			<Popover.Popup class={styles.Popup}>
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
