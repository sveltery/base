<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		Dialog,
		DirectionProvider,
		NavigationMenu,
		Popover,
		type NavigationMenuActions,
		type NavigationMenuChangeEventDetails,
		type NavigationMenuOrientation,
		type TextDirection
	} from '#lib';

	type Variant =
		| 'basic'
		| 'topLevelLink'
		| 'disabled'
		| 'customList'
		| 'action'
		| 'noViewport'
		| 'dialog'
		| 'popover'
		| 'single';

	let {
		variant = 'basic',
		value = $bindable(null),
		item1Value = 'item-1',
		onValueChange,
		onOpenChangeComplete,
		orientation,
		delay,
		closeDelay,
		keepMountedPortal = false,
		outside = false,
		withArrow = false,
		withIcon = false,
		side,
		direction = 'ltr'
	}: {
		variant?: Variant;
		value?: unknown;
		item1Value?: unknown;
		onValueChange?: (value: unknown, details: NavigationMenuChangeEventDetails) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		orientation?: NavigationMenuOrientation;
		delay?: number;
		closeDelay?: number;
		keepMountedPortal?: boolean;
		outside?: boolean;
		withArrow?: boolean;
		withIcon?: boolean;
		side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
		direction?: TextDirection;
	} = $props();

	let root = $state<NavigationMenuActions | undefined>(undefined);

	export function close() {
		root?.close();
	}

	export function unmount() {
		root?.unmount();
	}
</script>

{#if outside}<button type="button" data-testid="first">First</button>{/if}

{#snippet panel(index: number)}
	{#if variant === 'action'}
		<button type="button" data-testid="action">Action</button>
	{:else if variant === 'dialog'}
		<Dialog.Root>
			<Dialog.Trigger data-testid="dialog-trigger">Open dialog</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Popup
					data-testid="dialog-popup"
					style="position: relative; z-index: 1"
					onclick={(event) => event.stopPropagation()}
				>
					<button type="button" data-testid="dialog-button">Dialog button</button>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	{:else if variant === 'popover'}
		<Popover.Root>
			<Popover.Trigger data-testid="popover-trigger">Open popover</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner>
					<Popover.Popup data-testid="popover-popup" onclick={(event) => event.stopPropagation()}>
						<button type="button" data-testid="popover-button">Popover button</button>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	{:else if variant === 'noViewport'}
		Content
	{:else}
		<NavigationMenu.Link href="#link-{index * 2 - 1}" data-testid="link-{index * 2 - 1}">
			Link {index * 2 - 1}
		</NavigationMenu.Link>
		{#if variant !== 'topLevelLink' && variant !== 'single'}
			<NavigationMenu.Link href="#link-{index * 2}" data-testid="link-{index * 2}">
				Link {index * 2}
			</NavigationMenu.Link>
		{/if}
	{/if}
{/snippet}

{#snippet items()}
	<NavigationMenu.Item value={item1Value}>
		<NavigationMenu.Trigger data-testid="trigger-1" disabled={variant === 'disabled'}>
			Item 1
			{#if withIcon}<NavigationMenu.Icon data-testid="icon-1" />{/if}
		</NavigationMenu.Trigger>
		<NavigationMenu.Content data-testid="popup-1">
			{@render panel(1)}
		</NavigationMenu.Content>
	</NavigationMenu.Item>
	{#if variant === 'topLevelLink'}
		<NavigationMenu.Item>
			<NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">
				Top level link
			</NavigationMenu.Link>
		</NavigationMenu.Item>
	{/if}
	{#if !['disabled', 'action', 'noViewport', 'dialog', 'popover', 'single'].includes(variant)}
		<NavigationMenu.Item value="item-2">
			<NavigationMenu.Trigger data-testid="trigger-2">
				Item 2
				{#if withIcon}<NavigationMenu.Icon data-testid="icon-2" />{/if}
			</NavigationMenu.Trigger>
			<NavigationMenu.Content data-testid="popup-2">
				{@render panel(2)}
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	{/if}
{/snippet}

<DirectionProvider {direction}>
	<NavigationMenu.Root
		bind:this={root}
		bind:value
		{onValueChange}
		{onOpenChangeComplete}
		{orientation}
		{delay}
		{closeDelay}
		data-testid="root"
	>
		{#if variant === 'customList'}
			<NavigationMenu.List data-testid="list">
				{#snippet render(props, _state, children)}
					<div {...props as HTMLAttributes<HTMLElement>} data-testid="custom-list">
						{@render children?.()}
					</div>
				{/snippet}
				{@render items()}
			</NavigationMenu.List>
		{:else}
			<NavigationMenu.List data-testid="list">{@render items()}</NavigationMenu.List>
		{/if}

		<NavigationMenu.Portal keepMounted={keepMountedPortal}>
			<NavigationMenu.Positioner data-testid="top-level-positioner" {side}>
				<NavigationMenu.Popup data-testid="popup-root">
					{#if withArrow}<NavigationMenu.Arrow data-testid="arrow" />{/if}
					{#if variant === 'noViewport'}
						Popup
					{:else}
						<NavigationMenu.Viewport data-testid="viewport" />
					{/if}
				</NavigationMenu.Popup>
			</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
</DirectionProvider>

{#if outside}<button type="button" data-testid="last">Last</button>{/if}
