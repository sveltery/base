<script lang="ts">
	import { Popover, Select } from '#lib';

	let {
		popoverOpen = $bindable(true),
		popoverModal = false,
		selectModal = true,
		alignItemWithTrigger = true,
		defaultValue,
		withList = false,
		programmatic = false
	}: {
		popoverOpen?: boolean;
		popoverModal?: boolean;
		selectModal?: boolean;
		alignItemWithTrigger?: boolean;
		defaultValue?: string;
		withList?: boolean;
		/** Adds a button inside the popover that opens the select through its binding. */
		programmatic?: boolean;
	} = $props();

	let selectOpen = $state(false);
	const items = $derived(
		withList
			? [
					['gala', 'Gala'],
					['fuji', 'Fuji'],
					['honeycrisp', 'Honeycrisp']
				]
			: [
					['gala', 'Gala'],
					['fuji', 'Fuji']
				]
	);
</script>

<Popover.Root bind:open={popoverOpen} modal={popoverModal}>
	<Popover.Trigger>Open popover</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup data-testid="popover-popup" initialFocus={withList ? false : undefined}>
				{#if programmatic}
					<button type="button" onclick={() => (selectOpen = true)}>
						Open select programmatically
					</button>
				{/if}
				<Select.Root bind:open={selectOpen} modal={selectModal} {defaultValue}>
					{#if withList}<Select.Label>Apple</Select.Label>{/if}
					<Select.Trigger data-testid="select-trigger">
						<Select.Value placeholder="Pick one" />
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner {alignItemWithTrigger} sideOffset={withList ? 8 : undefined}>
							<Select.Popup>
								{#if withList}<Select.ScrollUpArrow />{/if}
								{#if withList}
									<Select.List>
										{#each items as [value, label] (value)}
											<Select.Item {value}>{label}</Select.Item>
										{/each}
									</Select.List>
								{:else}
									{#each items as [value, label] (value)}
										<Select.Item {value}>{label}</Select.Item>
									{/each}
								{/if}
								{#if withList}<Select.ScrollDownArrow />{/if}
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
