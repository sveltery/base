<!--
	One menu part rendered outside the context it needs.
	Derived from Base UI v1.9.0 the Menu part tests under packages/react/src/menu
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	let {
		part
	}: {
		part:
			| 'trigger'
			| 'item'
			| 'group-label'
			| 'submenu-trigger'
			| 'bare-submenu-trigger'
			| 'submenu-root'
			| 'checkbox-indicator'
			| 'radio-indicator'
			| 'radio-item'
			| 'popup'
			| 'positioner'
			| 'input'
			| 'clear'
			| 'empty'
			| 'filter-without-input';
	} = $props();
</script>

{#if part === 'trigger'}
	<Menu.Trigger>Open</Menu.Trigger>
{:else if part === 'item'}
	<Menu.Item>Item</Menu.Item>
{:else if part === 'group-label'}
	<Menu.GroupLabel>Label</Menu.GroupLabel>
{:else if part === 'submenu-trigger'}
	<Menu.Root open>
		<Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
	</Menu.Root>
{:else if part === 'bare-submenu-trigger'}
	<Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
{:else if part === 'submenu-root'}
	<Menu.SubmenuRoot>
		<Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
	</Menu.SubmenuRoot>
{:else if part === 'checkbox-indicator'}
	<Menu.CheckboxItemIndicator />
{:else if part === 'radio-indicator'}
	<Menu.RadioItemIndicator />
{:else if part === 'radio-item'}
	<Menu.Root open>
		<Menu.RadioItem value="a">A</Menu.RadioItem>
	</Menu.Root>
{:else if part === 'popup'}
	<Menu.Root open>
		<Menu.Popup />
	</Menu.Root>
{:else if part === 'input'}
	<Menu.Root open>
		<Menu.Input />
	</Menu.Root>
{:else if part === 'clear'}
	<Menu.Root open>
		<Menu.Clear />
	</Menu.Root>
{:else if part === 'empty'}
	<Menu.Root open>
		<Menu.Empty />
	</Menu.Root>
{:else if part === 'filter-without-input'}
	<Menu.FilterProvider>
		<Menu.Root open>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.List><Menu.Item>Rename</Menu.Item></Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else if part === 'positioner'}
	<Menu.Root open>
		<Menu.Positioner />
	</Menu.Root>
{/if}
