<script lang="ts" module>
	export type DefaultPropsCase =
		| 'accordion'
		| 'alert-dialog'
		| 'alert-dialog-trigger'
		| 'alert-dialog-closed'
		| 'autocomplete'
		| 'collapsible'
		| 'combobox'
		| 'context-menu'
		| 'dialog'
		| 'dialog-trigger'
		| 'drawer'
		| 'drawer-trigger'
		| 'menu'
		| 'menu-trigger'
		| 'menu-submenu'
		| 'menu-checkbox-item'
		| 'menu-radio-group'
		| 'menu-filter'
		| 'navigation-menu'
		| 'popover'
		| 'popover-trigger'
		| 'preview-card'
		| 'preview-card-trigger'
		| 'select'
		| 'tabs'
		| 'toggle'
		| 'toggle-group'
		| 'toolbar-input'
		| 'tooltip'
		| 'tooltip-trigger'
		| 'tabs-object'
		| 'accordion-object'
		| 'menu-radio-group-object'
		| 'navigation-menu-object';
</script>

<script lang="ts">
	import {
		Accordion,
		AlertDialog,
		Autocomplete,
		Collapsible,
		Combobox,
		ContextMenu,
		Dialog,
		Drawer,
		Menu,
		NavigationMenu,
		Popover,
		PreviewCard,
		Select,
		Tabs,
		Toggle,
		ToggleGroup,
		Toolbar,
		Tooltip
	} from '#lib';

	let { part }: { part: DefaultPropsCase } = $props();

	const items = ['Apple', 'Banana'];
	const first = { id: 'first' };
	const second = { id: 'second' };
	const options = items.map((item) => ({ value: item, label: item }));
</script>

{#if part === 'accordion'}
	<Accordion.Root defaultValue={['a']}>
		<Accordion.Item value="a">
			<Accordion.Header><Accordion.Trigger>Section</Accordion.Trigger></Accordion.Header>
			<Accordion.Panel>Content</Accordion.Panel>
		</Accordion.Item>
	</Accordion.Root>
{:else if part === 'collapsible'}
	<Collapsible.Root defaultOpen>
		<Collapsible.Trigger>Trigger</Collapsible.Trigger>
		<Collapsible.Panel>Content</Collapsible.Panel>
	</Collapsible.Root>
{:else if part === 'toggle'}
	<Toggle defaultPressed aria-label="Bold">B</Toggle>
{:else if part === 'toggle-group'}
	<ToggleGroup defaultValue={['a']}>
		<Toggle value="a">A</Toggle>
		<Toggle value="b">B</Toggle>
	</ToggleGroup>
{:else if part === 'tabs'}
	<Tabs.Root defaultValue="b">
		<Tabs.List>
			<Tabs.Tab value="a">A</Tabs.Tab>
			<Tabs.Tab value="b">B</Tabs.Tab>
		</Tabs.List>
		<Tabs.Panel value="a">Panel A</Tabs.Panel>
		<Tabs.Panel value="b">Panel B</Tabs.Panel>
	</Tabs.Root>
{:else if part === 'dialog' || part === 'dialog-trigger'}
	<Dialog.Root defaultOpen defaultTriggerId={part === 'dialog-trigger' ? 'second' : undefined}>
		<Dialog.Trigger id="first">First</Dialog.Trigger>
		<Dialog.Trigger id="second">Second</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup>
				<Dialog.Title>Dialog</Dialog.Title>
				<Dialog.Close>Close</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if part === 'alert-dialog' || part === 'alert-dialog-trigger' || part === 'alert-dialog-closed'}
	<AlertDialog.Root
		defaultOpen
		open={part === 'alert-dialog-closed' ? false : undefined}
		defaultTriggerId={part === 'alert-dialog-trigger' ? 'second' : undefined}
	>
		<AlertDialog.Trigger id="first">First</AlertDialog.Trigger>
		<AlertDialog.Trigger id="second">Second</AlertDialog.Trigger>
		<AlertDialog.Portal>
			<AlertDialog.Popup>
				<AlertDialog.Title>Alert</AlertDialog.Title>
				<AlertDialog.Close>Close</AlertDialog.Close>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
{:else if part === 'drawer' || part === 'drawer-trigger'}
	<Drawer.Root defaultOpen defaultTriggerId={part === 'drawer-trigger' ? 'second' : undefined}>
		<Drawer.Trigger id="first">First</Drawer.Trigger>
		<Drawer.Trigger id="second">Second</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Popup>
				<Drawer.Title>Drawer</Drawer.Title>
				<Drawer.Close>Close</Drawer.Close>
			</Drawer.Popup>
		</Drawer.Portal>
	</Drawer.Root>
{:else if part === 'popover' || part === 'popover-trigger'}
	<Popover.Root defaultOpen defaultTriggerId={part === 'popover-trigger' ? 'second' : undefined}>
		<Popover.Trigger id="first">First</Popover.Trigger>
		<Popover.Trigger id="second">Second</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup>
					<Popover.Title>Popover</Popover.Title>
					<Popover.Close>Close</Popover.Close>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else if part === 'tooltip' || part === 'tooltip-trigger'}
	<Tooltip.Root defaultOpen defaultTriggerId={part === 'tooltip-trigger' ? 'second' : undefined}>
		<Tooltip.Trigger id="first">First</Tooltip.Trigger>
		<Tooltip.Trigger id="second">Second</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup data-testid="popup">Tip</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{:else if part === 'preview-card' || part === 'preview-card-trigger'}
	<PreviewCard.Root
		defaultOpen
		defaultTriggerId={part === 'preview-card-trigger' ? 'second' : undefined}
	>
		<PreviewCard.Trigger id="first" href="#first">First</PreviewCard.Trigger>
		<PreviewCard.Trigger id="second" href="#second">Second</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner>
				<PreviewCard.Popup data-testid="popup">Card</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else if part === 'menu' || part === 'menu-trigger'}
	<Menu.Root defaultOpen defaultTriggerId={part === 'menu-trigger' ? 'second' : undefined}>
		<Menu.Trigger id="first">First</Menu.Trigger>
		<Menu.Trigger id="second">Second</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Item>Rename</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{:else if part === 'menu-submenu'}
	<Menu.Root defaultOpen>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.SubmenuRoot defaultOpen>
						<Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
						<Menu.Portal>
							<Menu.Positioner>
								<Menu.Popup>
									<Menu.Item>Archive</Menu.Item>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.SubmenuRoot>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{:else if part === 'menu-checkbox-item' || part === 'menu-radio-group'}
	<Menu.Root defaultOpen>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					{#if part === 'menu-checkbox-item'}
						<Menu.CheckboxItem defaultChecked>Wrap</Menu.CheckboxItem>
					{:else}
						<Menu.RadioGroup defaultValue="b">
							<Menu.RadioItem value="a">A</Menu.RadioItem>
							<Menu.RadioItem value="b">B</Menu.RadioItem>
						</Menu.RadioGroup>
					{/if}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{:else if part === 'menu-filter'}
	<Menu.FilterProvider defaultValue="ren">
		<Menu.Root defaultOpen>
			<Menu.Trigger>Actions</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.Input aria-label="Filter actions" />
						<Menu.List>
							<Menu.Item>Rename</Menu.Item>
							<Menu.Item>Delete</Menu.Item>
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else if part === 'context-menu'}
	<ContextMenu.Root defaultOpen>
		<ContextMenu.Trigger>Area</ContextMenu.Trigger>
		<ContextMenu.Portal>
			<ContextMenu.Positioner>
				<ContextMenu.Popup>
					<ContextMenu.Item>Copy</ContextMenu.Item>
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{:else if part === 'navigation-menu'}
	<NavigationMenu.Root defaultValue="overview">
		<NavigationMenu.List>
			<NavigationMenu.Item value="overview">
				<NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#start">Quick Start</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		<NavigationMenu.Portal>
			<NavigationMenu.Positioner>
				<NavigationMenu.Popup>
					<NavigationMenu.Viewport />
				</NavigationMenu.Popup>
			</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
{:else if part === 'select'}
	<Select.Root defaultOpen items={options}>
		<Select.Trigger aria-label="Fruit"><Select.Value placeholder="Pick" /></Select.Trigger>
		<Select.Portal>
			<Select.Positioner>
				<Select.Popup>
					<Select.List>
						{#each items as item (item)}
							<Select.Item value={item}><Select.ItemText>{item}</Select.ItemText></Select.Item>
						{/each}
					</Select.List>
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	</Select.Root>
{:else if part === 'combobox'}
	<Combobox.Root defaultOpen {items}>
		<Combobox.Input aria-label="Fruit" />
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					<Combobox.List>
						<Combobox.Collection>
							{#snippet children(item: string)}
								<Combobox.Item value={item}>{item}</Combobox.Item>
							{/snippet}
						</Combobox.Collection>
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if part === 'autocomplete'}
	<Autocomplete.Root defaultOpen {items}>
		<Autocomplete.Input aria-label="Fruit" />
		<Autocomplete.Portal>
			<Autocomplete.Positioner>
				<Autocomplete.Popup>
					<Autocomplete.List>
						<Autocomplete.Collection>
							{#snippet children(item: string)}
								<Autocomplete.Item value={item}>{item}</Autocomplete.Item>
							{/snippet}
						</Autocomplete.Collection>
					</Autocomplete.List>
				</Autocomplete.Popup>
			</Autocomplete.Positioner>
		</Autocomplete.Portal>
	</Autocomplete.Root>
{:else if part === 'toolbar-input'}
	<Toolbar.Root>
		<Toolbar.Input aria-label="Search" defaultValue="draft" />
	</Toolbar.Root>
{:else if part === 'tabs-object'}
	<Tabs.Root defaultValue={second}>
		<Tabs.List>
			<Tabs.Tab value={first}>A</Tabs.Tab>
			<Tabs.Tab value={second}>B</Tabs.Tab>
		</Tabs.List>
	</Tabs.Root>
{:else if part === 'accordion-object'}
	<Accordion.Root defaultValue={[second]}>
		<Accordion.Item value={first}>
			<Accordion.Header><Accordion.Trigger>A</Accordion.Trigger></Accordion.Header>
			<Accordion.Panel>Panel A</Accordion.Panel>
		</Accordion.Item>
		<Accordion.Item value={second}>
			<Accordion.Header><Accordion.Trigger>B</Accordion.Trigger></Accordion.Header>
			<Accordion.Panel>Panel B</Accordion.Panel>
		</Accordion.Item>
	</Accordion.Root>
{:else if part === 'menu-radio-group-object'}
	<Menu.Root defaultOpen>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.RadioGroup defaultValue={second}>
						<Menu.RadioItem value={first}>A</Menu.RadioItem>
						<Menu.RadioItem value={second}>B</Menu.RadioItem>
					</Menu.RadioGroup>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{:else if part === 'navigation-menu-object'}
	<NavigationMenu.Root defaultValue={second}>
		<NavigationMenu.List>
			<NavigationMenu.Item value={first}>
				<NavigationMenu.Trigger>A</NavigationMenu.Trigger>
				<NavigationMenu.Content>Panel A</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value={second}>
				<NavigationMenu.Trigger>B</NavigationMenu.Trigger>
				<NavigationMenu.Content>Panel B</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		<NavigationMenu.Portal>
			<NavigationMenu.Positioner>
				<NavigationMenu.Popup>
					<NavigationMenu.Viewport />
				</NavigationMenu.Popup>
			</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
{/if}
