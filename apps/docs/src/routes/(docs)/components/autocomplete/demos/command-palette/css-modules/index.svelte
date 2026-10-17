<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Dialog } from '@sveltery/base/dialog';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import styles from './index.module.css';

	interface Item {
		value: string;
		label: string;
	}

	interface Group {
		value: string;
		items: Item[];
	}

	const suggestions: Item[] = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'figma', label: 'Figma' },
		{ value: 'slack', label: 'Slack' },
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'raycast', label: 'Raycast' },
		{ value: 'notion', label: 'Notion' },
		{ value: 'github', label: 'GitHub' },
		{ value: 'jira', label: 'Jira' },
		{ value: 'calendar', label: 'Google Calendar' },
		{ value: 'chrome', label: 'Google Chrome' },
		{ value: 'mail', label: 'Apple Mail' },
		{ value: 'terminal', label: 'Terminal' }
	];

	const commands: Item[] = [
		{ value: 'clipboard-history', label: 'Clipboard History' },
		{ value: 'import-extension', label: 'Import Extension' },
		{ value: 'create-snippet', label: 'Create Snippet' },
		{ value: 'system-preferences', label: 'System Preferences' },
		{ value: 'window-management', label: 'Window Management' },
		{ value: 'toggle-dark-mode', label: 'Toggle Dark Mode' },
		{ value: 'new-window', label: 'New Window' },
		{ value: 'new-tab', label: 'New Tab' },
		{ value: 'search-docs', label: 'Search Documentation' },
		{ value: 'capture-screen', label: 'Capture Screenshot' },
		{ value: 'close-sidebar', label: 'Toggle Sidebar' },
		{ value: 'toggle-terminal', label: 'Toggle Integrated Terminal' },
		{ value: 'run-script', label: 'Run Script' }
	];

	const groupedItems: Group[] = [
		{ value: 'Suggestions', items: suggestions },
		{ value: 'Commands', items: commands }
	];

	let open = $state(false);
	const shortcutsDescriptionId = $props.id();

	function handleItemClick() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={styles.Button}>Open command palette</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop class={styles.Backdrop} />
		<Dialog.Viewport class={styles.Viewport}>
			<Dialog.Popup class={styles.Popup} aria-label="Command palette">
				<Autocomplete.Root open inline items={groupedItems} autoHighlight="always" keepHighlight>
					<Autocomplete.InputGroup class={styles.InputGroup}>
						{@render magnifyingGlassIcon(styles.InputIcon)}
						<Autocomplete.Input
							class={styles.Input}
							aria-label="Search commands"
							aria-describedby={shortcutsDescriptionId}
							placeholder="Search for apps and commands…"
						/>
					</Autocomplete.InputGroup>
					<Dialog.Close class={styles.VisuallyHidden}>Close command palette</Dialog.Close>

					<ScrollArea.Root class={styles.ListArea}>
						<ScrollArea.Viewport class={styles.ListViewport}>
							<ScrollArea.Content class={styles.ListContent}>
								<Autocomplete.Empty>
									<div class={styles.Empty}>No results found.</div>
								</Autocomplete.Empty>

								<Autocomplete.List class={styles.List}>
									<Autocomplete.Collection>
										{#snippet children(group: Group)}
											<Autocomplete.Group items={group.items} class={styles.Group}>
												<Autocomplete.GroupLabel class={styles.GroupLabel}>
													{group.value}
												</Autocomplete.GroupLabel>
												<Autocomplete.Collection>
													{#snippet children(item: Item)}
														<Autocomplete.Item
															value={item}
															class={styles.Item}
															onclick={handleItemClick}
														>
															<span class={styles.ItemLabel}>{item.label}</span>
															<span class={styles.ItemType}>
																{group.value === 'Suggestions' ? 'Application' : 'Command'}
															</span>
														</Autocomplete.Item>
													{/snippet}
												</Autocomplete.Collection>
											</Autocomplete.Group>
										{/snippet}
									</Autocomplete.Collection>
								</Autocomplete.List>
							</ScrollArea.Content>
						</ScrollArea.Viewport>
						<ScrollArea.Scrollbar class={styles.Scrollbar}>
							<ScrollArea.Thumb class={styles.ScrollbarThumb} />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>

					<div class={styles.Footer}>
						<span id={shortcutsDescriptionId} class={styles.VisuallyHidden}>
							Use Enter to activate the highlighted item.
						</span>
						<div class={styles.FooterLeft}>
							<span>Activate</span>
							<kbd class={styles.Kbd}>Enter</kbd>
						</div>
					</div>
				</Autocomplete.Root>
			</Dialog.Popup>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>

{#snippet magnifyingGlassIcon(className: string)}
	<svg
		class={className}
		aria-hidden="true"
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="m11 11 3.5 3.5" />
		<circle cx="7" cy="7" r="5.5" />
	</svg>
{/snippet}
