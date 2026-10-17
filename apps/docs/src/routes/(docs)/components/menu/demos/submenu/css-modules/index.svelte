<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	function getOffset({ side }: { side: string }) {
		return side === 'top' || side === 'bottom' ? 4 : -4;
	}
</script>

<Menu.Root>
	<Menu.Trigger class={styles.Button}>
		Song
		{@render caretDownIcon()}
	</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
			<Menu.Popup class={styles.Popup}>
				<Menu.Item class={styles.Item}>Add to Library</Menu.Item>

				<Menu.SubmenuRoot>
					<Menu.SubmenuTrigger class={styles.SubmenuTrigger}>
						Add to Playlist
						{@render caretRightIcon()}
					</Menu.SubmenuTrigger>
					<Menu.Portal>
						<Menu.Positioner
							class={styles.Positioner}
							sideOffset={getOffset}
							alignOffset={getOffset}
						>
							<Menu.Popup class={styles.Popup}>
								<Menu.Item class={styles.Item}>Get Up!</Menu.Item>
								<Menu.Item class={styles.Item}>Inside Out</Menu.Item>
								<Menu.Item class={styles.Item}>Night Beats</Menu.Item>
								<Menu.Separator class={styles.Separator} />
								<Menu.Item class={styles.Item}>New playlist…</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>

				<Menu.Separator class={styles.Separator} />
				<Menu.Item class={styles.Item}>Play Next</Menu.Item>
				<Menu.Item class={styles.Item}>Play Last</Menu.Item>
				<Menu.Separator class={styles.Separator} />
				<Menu.Item class={styles.Item}>Favorite</Menu.Item>
				<Menu.Item class={styles.Item}>Share</Menu.Item>
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

{#snippet caretRightIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		style="display: block"
		aria-hidden="true"
	>
		<path d="M6 12V4l4.5 4z" />
	</svg>
{/snippet}
