<script lang="ts">
	import { Dialog, Popover } from '#lib';

	type Change = 'disabled' | 'tabIndex' | 'hidden' | 'removed' | 'inserted' | 'reordered';

	let {
		tabindex,
		outside = true,
		finalFocus,
		change,
		dialog = false,
		direction = 'forward',
		open = $bindable(false)
	}: {
		tabindex?: number;
		outside?: boolean;
		finalFocus?: 'element' | 'function';
		/** Renders a target and a candidate control that change when the popover closes. */
		change?: Change;
		/** Renders the popover inside a modal dialog. */
		dialog?: boolean;
		/** Which side of the popover the changing controls or the dialog's button sit on. */
		direction?: 'forward' | 'backward';
		open?: boolean;
	} = $props();

	let finalFocusElement = $state<HTMLButtonElement>();
	let dialogOpen = $state(true);

	const controls = $derived.by(() => {
		let order: ('target' | 'candidate')[];
		if (change === 'inserted') order = open ? ['candidate'] : ['target', 'candidate'];
		else if (change === 'reordered')
			order = open ? ['candidate', 'target'] : ['target', 'candidate'];
		else order = change === 'removed' && !open ? ['target'] : ['candidate', 'target'];
		return direction === 'backward' ? order.reverse() : order;
	});
</script>

{#snippet changingControls()}
	{#each controls as control (control)}
		{#if control === 'target'}
			<button type="button" data-testid="target">Target</button>
		{:else}
			<button
				type="button"
				disabled={change === 'disabled' && !open}
				tabindex={change === 'tabIndex' && !open ? -1 : 0}
				hidden={change === 'hidden' && !open}>Candidate</button
			>
		{/if}
	{/each}
{/snippet}

{#snippet popover()}
	<Popover.Root bind:open>
		<Popover.Trigger {tabindex}>Toggle</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup
					data-testid="popup"
					class="guard-popup"
					finalFocus={finalFocus === 'element'
						? finalFocusElement
						: finalFocus === 'function'
							? () => true
							: undefined}
				>
					<button type="button" data-testid="inside">Inside</button>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/snippet}

<svelte:element this={"style"}>
	{`.guard-popup { transition: opacity 200ms; } .guard-popup[data-ending-style] { opacity: 0; }`}
</svelte:element>
{#if dialog}
	<button type="button">Outside dialog</button>
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Portal>
			<Dialog.Popup style="position: relative">
				{#if direction === 'forward'}<button type="button">Inside dialog</button>{/if}
				{@render popover()}
				{#if direction === 'backward'}<button type="button">Inside dialog</button>{/if}
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{:else if change}
	{#if direction === 'backward'}{@render changingControls()}{/if}
	{@render popover()}
	{#if direction === 'forward'}{@render changingControls()}{/if}
{:else}
	{#if outside}<button type="button" data-testid="before">Before</button>{/if}
	{@render popover()}
	{#if outside}<button type="button" data-testid="after">After</button>{/if}
	{#if finalFocus}<button type="button" bind:this={finalFocusElement}>Final focus</button>{/if}
{/if}
