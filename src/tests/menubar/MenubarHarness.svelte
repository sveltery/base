<!--
	Upstream `ContainedTriggerMenubar`, `DetachedTriggerMenubar` and
	`MultipleContainedTriggersMenubar` in one harness.
	Derived from Base UI v1.9.0 packages/react/src/menubar/Menubar.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu, Menubar, type MenubarProps } from '#lib';
	import type { ContentItem, MenuDefinition } from './menu-contents.js';
	import { menuContents } from './menu-contents.js';

	let {
		variant = 'contained',
		menubarProps = {},
		outside = false,
		onOpenChange
	}: {
		variant?: 'contained' | 'detached' | 'multiple';
		menubarProps?: MenubarProps;
		/** Renders an `outside` button after the menubar. */
		outside?: boolean;
		/** Called with the menu label for every root open change. */
		onOpenChange?: (label: string, open: boolean, reason: string) => void;
	} = $props();

	const handle = Menu.createHandle<MenuDefinition>();
</script>

{#snippet content(item: ContentItem)}
	{#if item.type === 'item'}
		<Menu.Item data-testid={item.testId}>{item.label}</Menu.Item>
	{:else if item.type === 'submenu'}
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger data-testid={item.testId}>{item.label}</Menu.SubmenuTrigger>
			<Menu.Portal>
				<Menu.Positioner data-testid={item.menuTestId}>
					<Menu.Popup>
						{#each item.items as child, index (index)}{@render content(child)}{/each}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.SubmenuRoot>
	{:else if item.type === 'radioGroup'}
		<Menu.RadioGroup value={item.defaultValue}>
			{#each item.items as child, index (index)}{@render content(child)}{/each}
		</Menu.RadioGroup>
	{:else}
		<Menu.RadioItem value={item.value} data-testid={item.testId}>{item.label}</Menu.RadioItem>
	{/if}
{/snippet}

{#snippet portal(menu: MenuDefinition | undefined)}
	<Menu.Portal>
		<Menu.Positioner data-testid={menu?.menuTestId}>
			<Menu.Popup>
				{#each menu?.items ?? [] as item, index (index)}{@render content(item)}{/each}
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
{/snippet}

{#snippet trigger(menu: MenuDefinition, detached: boolean)}
	<Menu.Trigger
		handle={detached ? handle : undefined}
		payload={menu}
		data-testid={menu.triggerTestId}>{menu.label}</Menu.Trigger
	>
{/snippet}

<Menubar {...menubarProps} style="max-width: 25vw; display: flex">
	{#if variant === 'contained'}
		{#each menuContents as menu (menu.label)}
			<Menu.Root onOpenChange={(open, details) => onOpenChange?.(menu.label, open, details.reason)}>
				<Menu.Trigger data-testid={menu.triggerTestId}>{menu.label}</Menu.Trigger>
				{@render portal(menu)}
			</Menu.Root>
		{/each}
	{:else if variant === 'detached'}
		{#each menuContents as menu (menu.label)}{@render trigger(menu, true)}{/each}
	{:else}
		<Menu.Root>
			{#snippet children({ payload }: { payload: unknown })}
				{#each menuContents as menu (menu.label)}{@render trigger(menu, false)}{/each}
				{@render portal(payload as MenuDefinition | undefined)}
			{/snippet}
		</Menu.Root>
	{/if}
</Menubar>
{#if variant === 'detached'}
	<Menu.Root {handle}>
		{#snippet children({ payload }: { payload: MenuDefinition | undefined })}
			{@render portal(payload)}
		{/snippet}
	</Menu.Root>
{/if}
{#if outside}
	<button data-testid="outside" type="button" style="margin-top: 300px">Outside</button>
{/if}
