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
		open = $bindable(),
		triggerId = $bindable(),
		onOpenChange,
		before = false,
		after = false,
		closeButton = false,
		inside = true,
		modal = false,
		keepMounted = false,
		popupClass,
		positionerClass,
		css = ''
	}: {
		handle?: PopoverHandle<number | string>;
		triggers?: TriggerSpec[];
		open?: boolean;
		triggerId?: string | null;
		onOpenChange?: (open: boolean, details: PopoverChangeEventDetails) => void;
		before?: boolean;
		after?: boolean;
		closeButton?: boolean;
		inside?: boolean;
		modal?: boolean | 'trap-focus';
		keepMounted?: boolean;
		popupClass?: string;
		positionerClass?: string;
		css?: string;
	} = $props();
</script>

<svelte:element this={'style'}>{css}</svelte:element>
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
	{#if after}<input data-testid="after" />{/if}
</div>

<Popover.Root {handle} bind:open bind:triggerId {onOpenChange} {modal}>
	{#snippet children({ payload })}
		<Popover.Portal {keepMounted}>
			<Popover.Positioner data-testid="positioner" class={positionerClass}>
				<Popover.Popup data-testid="popup" class={popupClass}>
					<span data-testid="content">{payload}</span>
					{#if inside}<input data-testid="input-inside" />{/if}
					{#if closeButton}<Popover.Close>Close</Popover.Close>{/if}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	{/snippet}
</Popover.Root>
