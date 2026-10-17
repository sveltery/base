<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	let value = $state('date');
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>
		Sort
		{@render caretDownIcon()}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
			<Menu.Popup class={styles.Popup}>
				<Menu.RadioGroup bind:value>
					<Menu.RadioItem class={styles.RadioItem} value="date">
						<Menu.RadioItemIndicator class={styles.RadioItemIndicator}>
							{@render checkIcon()}
						</Menu.RadioItemIndicator>
						<span class={styles.RadioItemText}>Date</span>
					</Menu.RadioItem>
					<Menu.RadioItem class={styles.RadioItem} value="name">
						<Menu.RadioItemIndicator class={styles.RadioItemIndicator}>
							{@render checkIcon()}
						</Menu.RadioItemIndicator>
						<span class={styles.RadioItemText}>Name</span>
					</Menu.RadioItem>
					<Menu.RadioItem class={styles.RadioItem} value="type">
						<Menu.RadioItemIndicator class={styles.RadioItemIndicator}>
							{@render checkIcon()}
						</Menu.RadioItemIndicator>
						<span class={styles.RadioItemText}>Type</span>
					</Menu.RadioItem>
				</Menu.RadioGroup>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>

{#snippet caretDownIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		style="display: block"
		aria-hidden="true"
	>
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet checkIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
		aria-hidden="true"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}
