<script lang="ts">
	import { Menu, type MenuChangeEventDetails, type MenuHighlightEventDetails } from '#lib';
	import type { MenuCase } from './cases.js';

	let { scenario }: { scenario: MenuCase } = $props();

	let calls = $state<{ open: boolean; reason: string }[]>([]);
	let subcalls = $state<{ open: boolean; reason: string }[]>([]);
	let highlights = $state<{ item: string | null; reason: string; label: string | null }[]>([]);
	let clicks = $state<string[]>([]);
	let bold = $state(false);
	let size = $state<unknown>('small');

	function changed(open: boolean, details: MenuChangeEventDetails) {
		calls.push({ open, reason: details.reason });
	}

	function highlighted(item: HTMLElement | undefined, details: MenuHighlightEventDetails) {
		highlights.push({
			item: item?.textContent?.trim() ?? null,
			reason: details.reason,
			label: details.label ?? null
		});
	}
</script>

<button type="button">Outside</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="subcalls">{JSON.stringify(subcalls)}</pre>
<pre data-testid="highlights">{JSON.stringify(highlights)}</pre>
<pre data-testid="clicks">{JSON.stringify(clicks)}</pre>
<pre data-testid="choices">{JSON.stringify({ bold, size })}</pre>

<Menu.Root onOpenChange={changed} onItemHighlighted={highlighted}>
	<Menu.Trigger openOnHover={scenario === 'hover'} delay={0}>Open</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				{#if scenario === 'choices'}
					<Menu.CheckboxItem bind:checked={bold}>
						<Menu.CheckboxItemIndicator data-testid="bold-indicator">✓</Menu.CheckboxItemIndicator>
						Bold
					</Menu.CheckboxItem>
					<Menu.Separator />
					<Menu.RadioGroup bind:value={size}>
						<Menu.GroupLabel>Size</Menu.GroupLabel>
						<Menu.RadioItem value="small">
							<Menu.RadioItemIndicator data-testid="small-indicator">•</Menu.RadioItemIndicator>
							Small
						</Menu.RadioItem>
						<Menu.RadioItem value="large">
							<Menu.RadioItemIndicator data-testid="large-indicator">•</Menu.RadioItemIndicator>
							Large
						</Menu.RadioItem>
					</Menu.RadioGroup>
				{:else}
					<Menu.Item onclick={() => clicks.push('Apple')}>Apple</Menu.Item>
					{#if scenario === 'submenu' || scenario === 'delay'}
						<Menu.SubmenuRoot
							onOpenChange={(open, details) => subcalls.push({ open, reason: details.reason })}
						>
							<Menu.SubmenuTrigger closeDelay={scenario === 'delay' ? 400 : 0}
								>More</Menu.SubmenuTrigger
							>
							<Menu.Portal>
								<Menu.Positioner>
									<Menu.Popup>
										<Menu.Item onclick={() => clicks.push('Delta')}>Delta</Menu.Item>
										<Menu.Item onclick={() => clicks.push('Echo')}>Echo</Menu.Item>
									</Menu.Popup>
								</Menu.Positioner>
							</Menu.Portal>
						</Menu.SubmenuRoot>
					{:else}
						<Menu.Item onclick={() => clicks.push('Banana')}>Banana</Menu.Item>
					{/if}
					<Menu.Item onclick={() => clicks.push('Cherry')}>Cherry</Menu.Item>
				{/if}
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
