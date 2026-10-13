<!--
	The context menus of upstream ContextMenuRoot.test.tsx, ContextMenuTrigger.test.tsx and the
	context-menu cases of MenuPositioner.test.tsx.
	Derived from Base UI v1.9.0 packages/react/src/context-menu/root/ContextMenuRoot.test.tsx,
	packages/react/src/context-menu/trigger/ContextMenuTrigger.test.tsx and
	packages/react/src/menu/positioner/MenuPositioner.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import {
		ContextMenu,
		Menu,
		Menubar,
		type ContextMenuPositionerProps,
		type ContextMenuRootProps,
		type ContextMenuTriggerProps,
		type MenuSubmenuRootProps,
		type MenuSubmenuTriggerProps
	} from '#lib';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

	let {
		scenario = 'basic',
		open = $bindable(),
		rootProps = {},
		triggerProps = {},
		positionerProps = {},
		submenuProps = {},
		submenuTriggerProps = {},
		showTrigger = true,
		backdrop = false,
		root = $bindable()
	}: {
		scenario?:
			| 'basic'
			| 'submenu'
			| 'nested'
			| 'in-popup'
			| 'surface-button'
			| 'portal-in-trigger'
			| 'with-menu'
			| 'with-menubar'
			| 'popup-only'
			| 'open-submenu';
		open?: boolean;
		rootProps?: ContextMenuRootProps;
		triggerProps?: ContextMenuTriggerProps & Record<string, unknown>;
		positionerProps?: ContextMenuPositionerProps & Record<string, unknown>;
		submenuProps?: MenuSubmenuRootProps;
		submenuTriggerProps?: MenuSubmenuTriggerProps & Record<string, unknown>;
		showTrigger?: boolean;
		backdrop?: boolean;
		root?: { close(): void; unmount(): void };
	} = $props();

	let portalContainer = $state<HTMLElement | null>(null);

	// Upstream renders the trigger as `<button />`. The props are the trigger's div props.
	const asButton = (props: HTMLAttributes<HTMLDivElement>) =>
		props as unknown as HTMLButtonAttributes;
</script>

{#snippet popup()}
	<ContextMenu.Portal>
		{#if backdrop}<ContextMenu.Backdrop data-testid="backdrop" />{/if}
		<ContextMenu.Positioner data-testid="positioner" {...positionerProps}>
			<ContextMenu.Popup data-testid="popup">
				<ContextMenu.Item data-testid="item">Item 1</ContextMenu.Item>
				<ContextMenu.Item>Item 2</ContextMenu.Item>
			</ContextMenu.Popup>
		</ContextMenu.Positioner>
	</ContextMenu.Portal>
{/snippet}

{#if scenario === 'basic'}
	<ContextMenu.Root bind:this={root} bind:open {...rootProps}>
		{#if showTrigger}
			<ContextMenu.Trigger data-testid="trigger" {...triggerProps}
				>Right click me</ContextMenu.Trigger
			>
		{/if}
		{@render popup()}
	</ContextMenu.Root>
{:else if scenario === 'popup-only'}
	<ContextMenu.Root bind:open {...rootProps}>
		{@render popup()}
	</ContextMenu.Root>
{:else if scenario === 'submenu' || scenario === 'open-submenu'}
	<ContextMenu.Root bind:open {...rootProps}>
		<ContextMenu.Trigger data-testid="trigger">Right click me</ContextMenu.Trigger>
		<ContextMenu.Portal>
			<ContextMenu.Positioner data-testid="positioner" {...positionerProps}>
				<ContextMenu.Popup data-testid="popup">
					<ContextMenu.Item data-testid="item">Item 1</ContextMenu.Item>
					<ContextMenu.SubmenuRoot {...submenuProps}>
						<ContextMenu.SubmenuTrigger data-testid="submenu-trigger" {...submenuTriggerProps}
							>More options</ContextMenu.SubmenuTrigger
						>
						<ContextMenu.Portal>
							<ContextMenu.Positioner data-testid="submenu-positioner">
								<ContextMenu.Popup data-testid="submenu-popup">
									<ContextMenu.Item data-testid="submenu-item">Deep action</ContextMenu.Item>
								</ContextMenu.Popup>
							</ContextMenu.Positioner>
						</ContextMenu.Portal>
					</ContextMenu.SubmenuRoot>
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{:else if scenario === 'nested'}
	<ContextMenu.Root {...rootProps}>
		<ContextMenu.Trigger data-testid="outer-trigger">
			outer
			<ContextMenu.Root>
				<ContextMenu.Trigger data-testid="inner-trigger">inner</ContextMenu.Trigger>
				<ContextMenu.Portal>
					<ContextMenu.Positioner>
						<ContextMenu.Popup data-testid="inner-menu">
							<ContextMenu.Item>Inner item</ContextMenu.Item>
						</ContextMenu.Popup>
					</ContextMenu.Positioner>
				</ContextMenu.Portal>
			</ContextMenu.Root>
		</ContextMenu.Trigger>
		<ContextMenu.Portal>
			<ContextMenu.Positioner>
				<ContextMenu.Popup data-testid="outer-menu">
					<ContextMenu.Item>Outer item</ContextMenu.Item>
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{:else if scenario === 'in-popup'}
	<ContextMenu.Root {...rootProps}>
		<ContextMenu.Trigger data-testid="outer-trigger">outer</ContextMenu.Trigger>
		<ContextMenu.Portal>
			<ContextMenu.Positioner>
				<ContextMenu.Popup data-testid="outer-menu">
					<ContextMenu.Root>
						<ContextMenu.Trigger data-testid="inner-trigger">
							<ContextMenu.Item>Outer item</ContextMenu.Item>
						</ContextMenu.Trigger>
						<ContextMenu.Portal>
							<ContextMenu.Positioner data-testid="inner-positioner">
								<ContextMenu.Popup data-testid="inner-menu">
									<ContextMenu.Item data-testid="inner-item">Inner item</ContextMenu.Item>
								</ContextMenu.Popup>
							</ContextMenu.Positioner>
						</ContextMenu.Portal>
					</ContextMenu.Root>
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{:else if scenario === 'surface-button'}
	<ContextMenu.Root {...rootProps}>
		<ContextMenu.Trigger>
			{#snippet render(props)}
				<button type="button" {...asButton(props)}>Surface</button>
			{/snippet}
		</ContextMenu.Trigger>
		<ContextMenu.Portal>
			<ContextMenu.Positioner>
				<ContextMenu.Popup>
					<ContextMenu.Item>Item</ContextMenu.Item>
				</ContextMenu.Popup>
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{:else if scenario === 'portal-in-trigger'}
	<ContextMenu.Root bind:open {...rootProps}>
		<ContextMenu.Trigger>
			Right click me
			<div bind:this={portalContainer}></div>
		</ContextMenu.Trigger>
		<ContextMenu.Portal container={portalContainer}>
			<ContextMenu.Positioner>
				<ContextMenu.Popup data-testid="popup" />
			</ContextMenu.Positioner>
		</ContextMenu.Portal>
	</ContextMenu.Root>
{:else if scenario === 'with-menu'}
	<ContextMenu.Root {...rootProps}>
		<ContextMenu.Trigger data-testid="trigger">
			Card
			<Menu.Root>
				<Menu.Trigger data-testid="menu-trigger">Actions</Menu.Trigger>
				<Menu.Portal>
					<Menu.Positioner>
						<Menu.Popup data-testid="menu-popup">
							<Menu.Item data-testid="menu-item">Menu item</Menu.Item>
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</ContextMenu.Trigger>
		{@render popup()}
	</ContextMenu.Root>
{:else if scenario === 'with-menubar'}
	<ContextMenu.Root {...rootProps}>
		<ContextMenu.Trigger data-testid="trigger">
			<Menubar>
				<Menu.Root>
					<Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
					<Menu.Portal>
						<Menu.Positioner>
							<Menu.Popup data-testid="file-menu">
								<Menu.Item data-testid="file-item">New</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</Menubar>
		</ContextMenu.Trigger>
		{@render popup()}
	</ContextMenu.Root>
{/if}
