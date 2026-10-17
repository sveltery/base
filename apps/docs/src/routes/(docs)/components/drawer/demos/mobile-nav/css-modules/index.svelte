<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import styles from './index.module.css';

	const ITEMS = [
		{ href: '/overview', label: 'Overview' },
		{ href: '/components', label: 'Components' },
		{ href: '/utils', label: 'Utilities' },
		{ href: '/overview/releases', label: 'Releases' }
	] as const;

	const LONG_LIST = [
		{ href: '/components/accordion', label: 'Accordion' },
		{ href: '/components/alert-dialog', label: 'Alert Dialog' },
		{ href: '/components/autocomplete', label: 'Autocomplete' },
		{ href: '/components/avatar', label: 'Avatar' },
		{ href: '/components/button', label: 'Button' },
		{ href: '/components/checkbox', label: 'Checkbox' },
		{ href: '/components/checkbox-group', label: 'Checkbox Group' },
		{ href: '/components/collapsible', label: 'Collapsible' },
		{ href: '/components/combobox', label: 'Combobox' },
		{ href: '/components/context-menu', label: 'Context Menu' },
		{ href: '/components/dialog', label: 'Dialog' },
		{ href: '/components/drawer', label: 'Drawer' },
		{ href: '/components/field', label: 'Field' },
		{ href: '/components/fieldset', label: 'Fieldset' },
		{ href: '/components/form', label: 'Form' },
		{ href: '/components/input', label: 'Input' },
		{ href: '/components/menu', label: 'Menu' },
		{ href: '/components/menubar', label: 'Menubar' },
		{ href: '/components/meter', label: 'Meter' },
		{ href: '/components/navigation-menu', label: 'Navigation Menu' },
		{ href: '/components/number-field', label: 'Number Field' },
		{ href: '/components/otp-field', label: 'OTP Field' },
		{ href: '/components/popover', label: 'Popover' },
		{ href: '/components/preview-card', label: 'Preview Card' },
		{ href: '/components/progress', label: 'Progress' },
		{ href: '/components/radio-group', label: 'Radio Group' },
		{ href: '/components/scroll-area', label: 'Scroll Area' },
		{ href: '/components/select', label: 'Select' },
		{ href: '/components/separator', label: 'Separator' },
		{ href: '/components/slider', label: 'Slider' },
		{ href: '/components/switch', label: 'Switch' },
		{ href: '/components/tabs', label: 'Tabs' },
		{ href: '/components/toast', label: 'Toast' },
		{ href: '/components/toggle', label: 'Toggle' },
		{ href: '/components/toggle-group', label: 'Toggle Group' },
		{ href: '/components/toolbar', label: 'Toolbar' },
		{ href: '/components/tooltip', label: 'Tooltip' }
	] as const;
</script>

<Drawer.Root>
	<Drawer.Trigger class={styles.Button}>Open mobile menu</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop class={styles.Backdrop} />
		<Drawer.Viewport class={styles.Viewport}>
			<ScrollArea.Root style="position: static" class={styles.ScrollAreaRoot}>
				<ScrollArea.Viewport class={styles.ScrollAreaViewport}>
					<ScrollArea.Content class={styles.ScrollContent}>
						<Drawer.Popup class={styles.Popup}>
							<nav aria-label="Navigation" class={styles.Panel}>
								<div class={styles.Header}>
									<div aria-hidden="true" class={styles.HeaderSpacer}></div>
									<div class={styles.Handle}></div>
									<Drawer.Close aria-label="Close menu" class={styles.CloseButton}>
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											stroke-linecap="square"
											stroke-linejoin="round"
											style="display: block"
										>
											<path d="m2.5 2.5 11 11m-11 0 11-11" />
										</svg>
									</Drawer.Close>
								</div>

								<Drawer.Content class={styles.Content}>
									<Drawer.Title class={styles.Title}>Menu</Drawer.Title>
									<Drawer.Description class={styles.Description}>
										Scroll the long list. Flick down from the top to dismiss.
									</Drawer.Description>

									<div class={styles.ScrollArea}>
										<ul class={styles.List}>
											{#each ITEMS as item (item.label)}
												<li class={styles.Item}>
													<a class={styles.Link} href={item.href}>{item.label}</a>
												</li>
											{/each}
										</ul>

										<ul class={styles.LongList} aria-label="Component links">
											{#each LONG_LIST as item (item.label)}
												<li class={styles.Item}>
													<a class={styles.Link} href={item.href}>{item.label}</a>
												</li>
											{/each}
										</ul>
									</div>
								</Drawer.Content>
							</nav>
						</Drawer.Popup>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar class={styles.Scrollbar}>
					<ScrollArea.Thumb class={styles.ScrollbarThumb} />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
