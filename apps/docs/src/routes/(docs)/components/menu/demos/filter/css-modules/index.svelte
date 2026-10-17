<script lang="ts">
	import { Menu } from '@sveltery/base/menu';
	import styles from './index.module.css';

	let sort = $state('date');
	let showDetails = $state(true);
	let showSidebar = $state(false);
	let keepOffline = $state(false);

	const sharingOptions = [
		'Email',
		'Messages',
		'AirDrop',
		'Copy link',
		'Invite collaborators',
		'Publish to web',
		'Send a copy'
	];

	const folderOptions = [
		'Desktop',
		'Documents',
		'Downloads',
		'Projects',
		'Archive',
		'Shared',
		'Trash'
	];

	const exportOptions = [
		'PDF document',
		'Word document',
		'Plain text',
		'Rich text',
		'Markdown',
		'HTML page',
		'Image'
	];

	function getSubmenuOffset({ side }: { side: string }) {
		return side === 'top' || side === 'bottom' ? 4 : -4;
	}
</script>

{#snippet filterableSubmenu(
	label: string,
	inputLabel: string,
	placeholder: string,
	emptyText: string,
	options: readonly string[]
)}
	<Menu.FilterProvider>
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger class={styles.SubmenuTrigger}>
				{label}
				{@render caretRightIcon()}
			</Menu.SubmenuTrigger>
			<Menu.Portal>
				<Menu.Positioner
					class={styles.Positioner}
					sideOffset={getSubmenuOffset}
					alignOffset={getSubmenuOffset}
				>
					<Menu.Popup class={styles.Popup}>
						<div class={styles.InputContainer}>
							<Menu.Input class={styles.Input} aria-label={inputLabel} {placeholder} />
							<Menu.Clear class={styles.Clear}>
								{@render clearIcon()}
							</Menu.Clear>
						</div>
						<Menu.Empty class={styles.Empty}>{emptyText}</Menu.Empty>
						<Menu.List class="{styles.List} {styles.SubmenuList}">
							{#each options as option (option)}
								<Menu.Item class={styles.Item}>{option}</Menu.Item>
							{/each}
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.SubmenuRoot>
	</Menu.FilterProvider>
{/snippet}

<Menu.FilterProvider>
	<Menu.Root>
		<Menu.Trigger class={styles.Trigger}>
			Actions {@render caretDownIcon()}
		</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner class={styles.Positioner} sideOffset={8} align="start">
				<Menu.Popup class={styles.Popup}>
					<div class={styles.InputContainer}>
						<Menu.Input class={styles.Input} aria-label="Filter actions" placeholder="e.g. Save" />
						<Menu.Clear class={styles.Clear}>
							{@render clearIcon()}
						</Menu.Clear>
					</div>
					<Menu.Empty class={styles.Empty}>No actions found.</Menu.Empty>
					<Menu.List class={styles.List}>
						<Menu.Group class={styles.Section}>
							<Menu.GroupLabel class={styles.GroupLabel}>File</Menu.GroupLabel>
							<Menu.Item class={styles.Item}>New file</Menu.Item>
							<Menu.Item class={styles.Item}>Open file</Menu.Item>
							<Menu.Item class={styles.Item}>Save</Menu.Item>
							<Menu.Item class={styles.Item}>Save as</Menu.Item>
							<Menu.Item class={styles.Item}>Duplicate</Menu.Item>
							<Menu.Item class={styles.Item}>Rename</Menu.Item>
						</Menu.Group>
						<Menu.Group class={styles.Section}>
							<Menu.GroupLabel class={styles.GroupLabel}>Organize</Menu.GroupLabel>
							{@render filterableSubmenu(
								'Move to folder',
								'Filter folders',
								'e.g. Projects',
								'No folders found.',
								folderOptions
							)}
							<Menu.SubmenuRoot>
								<Menu.SubmenuTrigger class={styles.SubmenuTrigger}>
									Share
									{@render caretRightIcon()}
								</Menu.SubmenuTrigger>
								<Menu.Portal>
									<Menu.Positioner
										class={styles.Positioner}
										sideOffset={getSubmenuOffset}
										alignOffset={getSubmenuOffset}
									>
										<Menu.Popup class={styles.Popup}>
											<Menu.List class="{styles.List} {styles.SubmenuList}">
												{#each sharingOptions as option (option)}
													<Menu.Item class={styles.Item}>{option}</Menu.Item>
												{/each}
											</Menu.List>
										</Menu.Popup>
									</Menu.Positioner>
								</Menu.Portal>
							</Menu.SubmenuRoot>
							{@render filterableSubmenu(
								'Export',
								'Filter export formats',
								'e.g. PDF',
								'No export formats found.',
								exportOptions
							)}
							<Menu.Item class={styles.Item}>Download a copy</Menu.Item>
							<Menu.Item class={styles.Item}>Delete</Menu.Item>
						</Menu.Group>

						<Menu.RadioGroup class={styles.Section} bind:value={sort}>
							<Menu.Separator class={styles.Separator} />
							<Menu.GroupLabel class={styles.GroupLabel}>Sort by</Menu.GroupLabel>
							{#each [['date', 'Date modified'], ['name', 'Name'], ['size', 'Size']] as [value, label] (value)}
								<Menu.RadioItem class={styles.ChoiceItem} {value}>
									<Menu.RadioItemIndicator class={styles.ChoiceIndicator}>
										{@render checkIcon()}
									</Menu.RadioItemIndicator>
									<span class={styles.ChoiceText}>{label}</span>
								</Menu.RadioItem>
							{/each}
						</Menu.RadioGroup>

						<Menu.Group class={styles.Section}>
							<Menu.Separator class={styles.Separator} />
							<Menu.GroupLabel class={styles.GroupLabel}>View</Menu.GroupLabel>
							<Menu.CheckboxItem class={styles.ChoiceItem} bind:checked={showDetails}>
								<Menu.CheckboxItemIndicator class={styles.ChoiceIndicator}>
									{@render checkIcon()}
								</Menu.CheckboxItemIndicator>
								<span class={styles.ChoiceText}>Show details</span>
							</Menu.CheckboxItem>
							<Menu.CheckboxItem class={styles.ChoiceItem} bind:checked={showSidebar}>
								<Menu.CheckboxItemIndicator class={styles.ChoiceIndicator}>
									{@render checkIcon()}
								</Menu.CheckboxItemIndicator>
								<span class={styles.ChoiceText}>Show sidebar</span>
							</Menu.CheckboxItem>
							<Menu.CheckboxItem class={styles.ChoiceItem} bind:checked={keepOffline}>
								<Menu.CheckboxItemIndicator class={styles.ChoiceIndicator}>
									{@render checkIcon()}
								</Menu.CheckboxItemIndicator>
								<span class={styles.ChoiceText}>Keep available offline</span>
							</Menu.CheckboxItem>
						</Menu.Group>
					</Menu.List>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet caretRightIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M6 12V4l4.5 4z" />
	</svg>
{/snippet}

{#snippet clearIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m3.5 3.5 9 9m0-9-9 9" />
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
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}
