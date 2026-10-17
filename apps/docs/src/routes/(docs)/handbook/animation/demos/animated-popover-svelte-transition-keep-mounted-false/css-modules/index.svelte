<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import { scale } from 'svelte/transition';
	import styles from './index.module.css';
</script>

<Popover.Root>
	<Popover.Trigger class={styles.Trigger}>Trigger</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner class={styles.Positioner} sideOffset={8}>
			<Popover.Popup class={styles.Popup}>
				{#snippet render(props, _state, children)}
					<div {...props} transition:scale|global={{ start: 0.8, duration: 200 }}>
						{@render children?.()}
					</div>
				{/snippet}
				Popup
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
