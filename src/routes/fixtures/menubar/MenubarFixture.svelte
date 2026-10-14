<script lang="ts">
	import { Menu, Menubar } from '#lib';
	import type { MenubarCase } from './cases.js';

	let { scenario }: { scenario: MenubarCase } = $props();

	const menus = [
		{ label: 'File', items: ['New', 'Open'] },
		{ label: 'Edit', items: ['Copy', 'Paste'] },
		{ label: 'View', items: ['Zoom In', 'Zoom Out'] }
	];

	let calls = $state<{ menu: string; open: boolean; reason: string }[]>([]);
	let clicks = $state<string[]>([]);
</script>

<button type="button">Outside</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="clicks">{JSON.stringify(clicks)}</pre>

<Menubar
	orientation={scenario === 'vertical' ? 'vertical' : 'horizontal'}
	loopFocus={scenario !== 'no-loop'}
	disabled={scenario === 'disabled'}
	style="display: flex; gap: 4px"
>
	{#each menus as menu (menu.label)}
		<Menu.Root
			onOpenChange={(open, details) =>
				calls.push({ menu: menu.label, open, reason: details.reason })}
		>
			<Menu.Trigger disabled={scenario === 'disabled-trigger' && menu.label === 'Edit'}
				>{menu.label}</Menu.Trigger
			>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup aria-label={`${menu.label} menu`}>
						{#each menu.items as item (item)}
							<Menu.Item onclick={() => clicks.push(item)}>{item}</Menu.Item>
						{/each}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	{/each}
</Menubar>
