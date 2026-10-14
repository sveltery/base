<!--
	The one-off menubars of upstream Menubar.test.tsx and the `Menubar parent` cases of
	MenuPositioner.test.tsx.
	Derived from Base UI v1.9.0 packages/react/src/menubar/Menubar.test.tsx and
	packages/react/src/menu/positioner/MenuPositioner.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import {
		DirectionProvider,
		Menu,
		Menubar,
		Popover,
		type MenubarProps,
		type TextDirection
	} from '#lib';

	let {
		scenario,
		direction = 'ltr',
		menubarProps = {},
		onItemClick,
		onOpenChange,
		open = $bindable(true)
	}: {
		scenario:
			| 'triggerless'
			| 'empty'
			| 'one'
			| 'two'
			| 'render'
			| 'scroll-wide'
			| 'scroll-narrow'
			| 'scroll-handoff'
			| 'first-disabled'
			| 'disabled-open'
			| 'open'
			| 'in-popover'
			| 'filterable';
		direction?: TextDirection;
		menubarProps?: MenubarProps;
		onItemClick?: () => void;
		/** Called with the menu label for every root open change of the `in-popover` menus. */
		onOpenChange?: (label: string, open: boolean, reason: string) => void;
		/** The open state of the triggerless menu. */
		open?: boolean;
	} = $props();
</script>

{#snippet menu(
	label: string,
	testId: string,
	item: string,
	options: { disabled?: boolean; width?: string; menuTestId?: string } = {}
)}
	<Menu.Root>
		<Menu.Trigger disabled={options.disabled} data-testid={testId}>{label}</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner
				data-testid={options.menuTestId}
				style={options.width ? `width: ${options.width}` : undefined}
			>
				<Menu.Popup>
					<Menu.Item>{item}</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/snippet}

<DirectionProvider {direction}>
	{#if scenario === 'triggerless'}
		<button data-testid="outside" type="button">Outside</button>
		<Menubar {...menubarProps}>
			<Menu.Root bind:open>
				<Menu.Portal keepMounted>
					<Menu.Positioner>
						<Menu.Popup data-testid="triggerless-menu">
							<Menu.Item>Item</Menu.Item>
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</Menubar>
	{:else if scenario === 'empty'}
		<Menubar {...menubarProps} />
	{:else if scenario === 'one'}
		<Menubar {...menubarProps}>
			{@render menu('File', 'first-trigger', 'New')}
		</Menubar>
	{:else if scenario === 'two'}
		<Menubar {...menubarProps}>
			{@render menu('File', 'first-trigger', 'New')}
			{@render menu('Edit', 'second-trigger', 'Undo')}
		</Menubar>
	{:else if scenario === 'render'}
		<Menubar {...menubarProps}>
			{#snippet render(props, state)}
				<div
					{...props}
					class="custom-bar"
					data-testid="rendered"
					data-state={`${state.orientation}${state.modal ? ' modal' : ''}`}
				></div>
			{/snippet}
		</Menubar>
	{:else if scenario === 'scroll-wide' || scenario === 'scroll-narrow'}
		<Menubar modal style="display: flex" {...menubarProps}>
			{@render menu('File', 'file-trigger', 'Open', {
				width: scenario === 'scroll-wide' ? 'calc(100vw - 10px)' : '240px',
				menuTestId: 'file-menu'
			})}
		</Menubar>
	{:else if scenario === 'scroll-handoff'}
		<Menubar modal style="display: flex" {...menubarProps}>
			{@render menu('File', 'file-trigger', 'Open', {
				width: 'calc(100vw - 10px)',
				menuTestId: 'file-menu'
			})}
			{@render menu('Edit', 'edit-trigger', 'Copy', { width: '240px', menuTestId: 'edit-menu' })}
		</Menubar>
	{:else if scenario === 'first-disabled'}
		<Menubar style="display: flex" {...menubarProps}>
			{@render menu('File', 'file-trigger', 'Open', { disabled: true })}
			{@render menu('Edit', 'edit-trigger', 'Copy')}
			{@render menu('View', 'view-trigger', 'Zoom')}
		</Menubar>
	{:else if scenario === 'disabled-open'}
		<Menubar disabled {...menubarProps}>
			<Menu.Root open>
				<Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
				<Menu.Portal>
					<Menu.Positioner>
						<Menu.Popup>
							<Menu.Item data-testid="file-item" onclick={onItemClick}>Open</Menu.Item>
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</Menubar>
	{:else if scenario === 'open'}
		<Menubar {...menubarProps}>
			<Menu.Root open>
				<Menu.Trigger style="width: 72px; height: 36px">File</Menu.Trigger>
				<Menu.Portal>
					<Menu.Positioner data-testid="open-positioner">
						<Menu.Popup style="width: 52px; height: 24px">Open</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</Menubar>
	{:else if scenario === 'in-popover'}
		<Popover.Root open>
			<Popover.Trigger>Popover</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner>
					<Popover.Popup>
						<Menubar {...menubarProps}>
							<Menu.Root
								onOpenChange={(next, details) => onOpenChange?.('File', next, details.reason)}
							>
								<Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
								<Menu.Portal>
									<Menu.Positioner data-testid="file-menu">
										<Menu.Popup>
											<Menu.Item>Open</Menu.Item>
										</Menu.Popup>
									</Menu.Positioner>
								</Menu.Portal>
							</Menu.Root>
						</Menubar>
						<Menu.Root
							modal={false}
							onOpenChange={(next, details) => onOpenChange?.('Standalone', next, details.reason)}
						>
							<Menu.Trigger data-testid="standalone-trigger">Standalone</Menu.Trigger>
							<Menu.Portal>
								<Menu.Positioner data-testid="standalone-menu">
									<Menu.Popup>
										<Menu.Item>Action</Menu.Item>
									</Menu.Popup>
								</Menu.Positioner>
							</Menu.Portal>
						</Menu.Root>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	{:else if scenario === 'filterable'}
		<Menubar {...menubarProps}>
			<Menu.FilterProvider>
				<Menu.Root>
					<Menu.Trigger>File</Menu.Trigger>
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup>
								<Menu.Input aria-label="Filter file actions" />
								<Menu.List>
									<Menu.Item>New file</Menu.Item>
									<Menu.Item>Open file</Menu.Item>
								</Menu.List>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</Menu.FilterProvider>
			<Menu.Root>
				<Menu.Trigger>Edit</Menu.Trigger>
				<Menu.Portal>
					<Menu.Positioner>
						<Menu.Popup>
							<Menu.Item>Copy</Menu.Item>
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</Menubar>
	{/if}
</DirectionProvider>
