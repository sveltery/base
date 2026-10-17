<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import { Menubar } from '@sveltery/base/menubar';
	import styles from './index.module.css';

	function handleClick(event: MouseEvent) {
		console.log(`${(event.currentTarget as HTMLElement).textContent?.trim()} clicked`);
	}
</script>

<Menubar class={styles.Menubar}>
	<Menu.Root>
		<Menu.Trigger class={styles.MenuTrigger}>File</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class={styles.MenuPositioner} sideOffset={4}>
				<Menu.Popup class={styles.MenuPopup}>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>New</Menu.Item>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Open</Menu.Item>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Save</Menu.Item>

					<Menu.SubmenuRoot>
						<Menu.SubmenuTrigger class={styles.SubmenuTrigger}>
							Export
							{@render caretRightIcon()}
						</Menu.SubmenuTrigger>
						<Menu.Portal>
							<Menu.Positioner class={styles.MenuPositioner} sideOffset={-4} alignOffset={-4}>
								<Menu.Popup class={styles.MenuPopup}>
									<Menu.Item class={styles.MenuItem} onclick={handleClick}>PDF</Menu.Item>
									<Menu.Item class={styles.MenuItem} onclick={handleClick}>PNG</Menu.Item>
									<Menu.Item class={styles.MenuItem} onclick={handleClick}>SVG</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.SubmenuRoot>

					<Menu.Separator class={styles.MenuSeparator} />
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Print</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>

	<Menu.Root>
		<Menu.Trigger class={styles.MenuTrigger}>Edit</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class={styles.MenuPositioner} sideOffset={4}>
				<Menu.Popup class={styles.MenuPopup}>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Cut</Menu.Item>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Copy</Menu.Item>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Paste</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>

	<Menu.Root>
		<Menu.Trigger class={styles.MenuTrigger}>View</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class={styles.MenuPositioner} sideOffset={4}>
				<Menu.Popup class={styles.MenuPopup}>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Zoom In</Menu.Item>
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Zoom Out</Menu.Item>

					<Menu.SubmenuRoot>
						<Menu.SubmenuTrigger class={styles.SubmenuTrigger}>
							Layout
							{@render caretRightIcon()}
						</Menu.SubmenuTrigger>
						<Menu.Portal>
							<Menu.Positioner class={styles.MenuPositioner} sideOffset={-4} alignOffset={-4}>
								<Menu.Popup class={styles.MenuPopup}>
									<Menu.Item class={styles.MenuItem} onclick={handleClick}>Single Page</Menu.Item>
									<Menu.Item class={styles.MenuItem} onclick={handleClick}>Two Pages</Menu.Item>
									<Menu.Item class={styles.MenuItem} onclick={handleClick}>Continuous</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.SubmenuRoot>

					<Menu.Separator class={styles.MenuSeparator} />
					<Menu.Item class={styles.MenuItem} onclick={handleClick}>Full Screen</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>

	<Menu.Root disabled>
		<Menu.Trigger class={styles.MenuTrigger}>Help</Menu.Trigger>
	</Menu.Root>
</Menubar>

{#snippet caretRightIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M6 12V4l4.5 4z" />
	</svg>
{/snippet}
