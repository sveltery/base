<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';
</script>

<Menu.Root>
	<Menu.Trigger openOnHover class={styles.Button}>
		Add to playlist
		{@render caretDownIcon()}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
			<Menu.Popup class={styles.Popup}>
				<Menu.Item class={styles.Item}>Get Up!</Menu.Item>
				<Menu.Item class={styles.Item}>Inside Out</Menu.Item>
				<Menu.Item class={styles.Item}>Night Beats</Menu.Item>
				<Menu.Separator class={styles.Separator} />
				<Menu.Item class={styles.Item}>New playlist…</Menu.Item>
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
