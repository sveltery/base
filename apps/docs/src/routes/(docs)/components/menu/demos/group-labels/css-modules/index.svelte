<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	let value = $state('date');
	let showMinimap = $state(true);
	let showSearch = $state(true);
	let showSidebar = $state(false);
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>
		View
		{@render caretDownIcon()}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
			<Menu.Popup class={styles.Popup}>
				<Menu.RadioGroup bind:value>
					<Menu.GroupLabel class={styles.GroupLabel}>Sort</Menu.GroupLabel>
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

				<Menu.Separator class={styles.Separator} />

				<Menu.Group>
					<Menu.GroupLabel class={styles.GroupLabel}>Workspace</Menu.GroupLabel>
					<Menu.CheckboxItem bind:checked={showMinimap} class={styles.CheckboxItem}>
						<Menu.CheckboxItemIndicator class={styles.CheckboxItemIndicator}>
							{@render checkIcon()}
						</Menu.CheckboxItemIndicator>
						<span class={styles.CheckboxItemText}>Minimap</span>
					</Menu.CheckboxItem>
					<Menu.CheckboxItem bind:checked={showSearch} class={styles.CheckboxItem}>
						<Menu.CheckboxItemIndicator class={styles.CheckboxItemIndicator}>
							{@render checkIcon()}
						</Menu.CheckboxItemIndicator>
						<span class={styles.CheckboxItemText}>Search</span>
					</Menu.CheckboxItem>
					<Menu.CheckboxItem bind:checked={showSidebar} class={styles.CheckboxItem}>
						<Menu.CheckboxItemIndicator class={styles.CheckboxItemIndicator}>
							{@render checkIcon()}
						</Menu.CheckboxItemIndicator>
						<span class={styles.CheckboxItemText}>Sidebar</span>
					</Menu.CheckboxItem>
				</Menu.Group>
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
