<script lang="ts">
	import { Popover, type PopoverChangeEventDetails, type PopoverHandle } from '#lib';

	interface TriggerSpec {
		id: string;
		label: string;
		payload?: number | string;
		openOnHover?: boolean;
		disabled?: boolean;
		shadowHost?: boolean;
		style?: string;
	}

	let {
		handle = Popover.createHandle<number | string>(),
		triggers = [{ id: 'trigger-1', label: 'Trigger 1', payload: 1 }],
		open = $bindable(false),
		triggerId = $bindable(),
		onOpenChange,
		before = false,
		inside = true,
		popupClass,
		positionerClass,
		css = '',
		viewport = false,
		close = false
	}: {
		handle?: PopoverHandle<number | string>;
		triggers?: TriggerSpec[];
		open?: boolean;
		triggerId?: string | null;
		onOpenChange?: (open: boolean, details: PopoverChangeEventDetails) => void;
		before?: boolean;
		inside?: boolean;
		popupClass?: string;
		positionerClass?: string;
		css?: string;
		viewport?: boolean;
		close?: boolean;
	} = $props();
</script>

<svelte:element this={"style"}>{css}</svelte:element>
<div style="position: relative; width: 400px; height: 200px">
	{#if before}<input data-testid="before" />{/if}
	{#each triggers as trigger (trigger.id)}
		<Popover.Trigger
			{handle}
			id={trigger.id}
			payload={trigger.payload}
			openOnHover={trigger.openOnHover}
			delay={0}
			disabled={trigger.disabled}
			style={trigger.style}
			>{trigger.label}{#if trigger.shadowHost}<span data-testid="shadow-host-{trigger.id}"
				></span>{/if}</Popover.Trigger
		>
	{/each}
</div>

<Popover.Root {handle} bind:open bind:triggerId {onOpenChange}>
	{#snippet children({ payload })}
		<Popover.Portal>
			<Popover.Positioner data-testid="positioner" class={positionerClass}>
				<Popover.Popup data-testid="popup" class={popupClass}>
					{#if viewport}
						<Popover.Viewport><span data-testid="content">Content {payload}</span></Popover.Viewport
						>
					{:else}
						<span data-testid="content">{payload}</span>
					{/if}
					{#if inside}<input data-testid="input-inside" />{/if}
					{#if close}<Popover.Close>Close</Popover.Close>{/if}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	{/snippet}
</Popover.Root>
