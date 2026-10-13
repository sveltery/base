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
			| 'positioner';
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
{:else if part === 'positioner'}
	<Menu.Root open>
		<Menu.Positioner />
	</Menu.Root>
{/if}
