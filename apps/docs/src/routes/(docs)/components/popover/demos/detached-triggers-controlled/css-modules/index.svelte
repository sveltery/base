<script lang="ts">
	import { Popover } from '@sveltery/base/popover';
	import styles from '../../_index.module.css';

	const demoPopover = Popover.createHandle();

	let open = $state(false);
	let triggerId = $state<string | null>(null);
</script>

<div class={styles.Container}>
	<Popover.Trigger class={styles.Button} handle={demoPopover} id="trigger-1">
		Trigger 1
	</Popover.Trigger>

	<Popover.Trigger class={styles.Button} handle={demoPopover} id="trigger-2">
		Trigger 2
	</Popover.Trigger>

	<Popover.Trigger class={styles.Button} handle={demoPopover} id="trigger-3">
		Trigger 3
	</Popover.Trigger>

	<button
		class={styles.Button}
		type="button"
		onclick={() => {
			triggerId = 'trigger-2';
			open = true;
		}}
	>
		Open programmatically
	</button>
</div>

<Popover.Root handle={demoPopover} bind:open bind:triggerId>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup class={styles.Popup}>
				<Popover.Arrow class={styles.Arrow} />
				<Popover.Title class={styles.Title}>Notifications</Popover.Title>
				<Popover.Description class={styles.Description}>
					You are all caught up. Good job!
				</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
