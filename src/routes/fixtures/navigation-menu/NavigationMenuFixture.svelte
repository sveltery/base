<script lang="ts">
	import { NavigationMenu, type NavigationMenuChangeEventDetails } from '#lib';
	import type { NavigationMenuCase } from './cases.js';

	let { scenario }: { scenario: NavigationMenuCase } = $props();

	let value = $state<string | null>(null);
	let calls = $state<{ value: string | null; reason: string }[]>([]);
	const delay = $derived(scenario === 'delays' ? 400 : undefined);
	const closeDelay = $derived(scenario === 'delays' ? 400 : undefined);
	const orientation = $derived(scenario === 'vertical' ? 'vertical' : 'horizontal');

	function changed(next: string | null, details: NavigationMenuChangeEventDetails) {
		calls.push({ value: next, reason: details.reason });
	}
</script>

<button type="button" style="position: fixed; right: 8px; bottom: 8px">Outside</button>
{#if scenario === 'bound'}
	<button type="button" data-testid="show" onclick={() => (value = 'handbook')}>Show</button>
	<button type="button" data-testid="hide" onclick={() => (value = null)}>Hide</button>
{/if}
<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="value">{String(value)}</pre>

<div style="margin: 40px">
	<NavigationMenu.Root bind:value onValueChange={changed} {delay} {closeDelay} {orientation}>
		<NavigationMenu.List style="display: flex; gap: 8px; list-style: none; margin: 0; padding: 0">
			<NavigationMenu.Item value="overview">
				<NavigationMenu.Trigger>
					Overview
					<NavigationMenu.Icon data-testid="overview-icon">v</NavigationMenu.Icon>
				</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="overview-content">
					<div style="width: 400px; height: 160px">
						<NavigationMenu.Link href="#quick-start" closeOnClick>Quick Start</NavigationMenu.Link>
						<NavigationMenu.Link href="#accessibility">Accessibility</NavigationMenu.Link>
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="handbook">
				<NavigationMenu.Trigger>Handbook</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="handbook-content">
					<div style="width: 300px; height: 100px">
						<NavigationMenu.Link href="#styling">Styling</NavigationMenu.Link>
						<NavigationMenu.Link href="#animation">Animation</NavigationMenu.Link>
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			{#if scenario === 'nested'}
				<NavigationMenu.Item value="product">
					<NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
					<NavigationMenu.Content data-testid="product-content">
						<NavigationMenu.Root value="developers" orientation="vertical">
							<NavigationMenu.List style="list-style: none; margin: 0; padding: 0">
								<NavigationMenu.Item value="developers">
									<NavigationMenu.Trigger>Developers</NavigationMenu.Trigger>
									<NavigationMenu.Content data-testid="developers-content">
										<NavigationMenu.Link href="#get-started">Get started</NavigationMenu.Link>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
								<NavigationMenu.Item value="design">
									<NavigationMenu.Trigger>Design</NavigationMenu.Trigger>
									<NavigationMenu.Content data-testid="design-content">
										<NavigationMenu.Link href="#design-guide" closeOnClick>
											Design guide
										</NavigationMenu.Link>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							</NavigationMenu.List>
							<NavigationMenu.Viewport data-testid="nested-viewport" />
						</NavigationMenu.Root>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			{/if}
			<NavigationMenu.Item>
				<NavigationMenu.Link href="#github">GitHub</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>

		<NavigationMenu.Portal>
			<NavigationMenu.Positioner data-testid="positioner" sideOffset={10}>
				<NavigationMenu.Popup data-testid="popup">
					<NavigationMenu.Arrow data-testid="arrow" />
					<NavigationMenu.Viewport data-testid="viewport" />
				</NavigationMenu.Popup>
			</NavigationMenu.Positioner>
		</NavigationMenu.Portal>
	</NavigationMenu.Root>
</div>
