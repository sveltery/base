<script lang="ts">
	import {
		Collapsible,
		type CollapsiblePanelState,
		type CollapsibleRootChangeEventDetails
	} from '#lib';

	let {
		open = $bindable(false),
		disabled = false,
		triggerDisabled = undefined as boolean | undefined,
		keepMounted = undefined as boolean | undefined,
		hiddenUntilFound = false,
		panelId = undefined as string | undefined,
		panelClass = undefined as string | undefined,
		panelStyle = undefined as string | undefined,
		showPanel = true,
		nativeButton = true,
		triggerAs = 'button' as 'button' | 'span',
		triggerId = undefined as string | undefined,
		content = 'This is panel content',
		triggerLabel = 'Trigger',
		css = '',
		external = false,
		recordStatuses = false,
		hideUnlessEnding = false,
		removeWhenClosed = false,
		onclick = undefined as ((event: MouseEvent) => void) | undefined,
		onOpenChange = undefined as
			((open: boolean, details: CollapsibleRootChangeEventDetails) => void) | undefined
	}: {
		open?: boolean;
		disabled?: boolean;
		triggerDisabled?: boolean;
		keepMounted?: boolean;
		hiddenUntilFound?: boolean;
		panelId?: string;
		panelClass?: string;
		panelStyle?: string;
		showPanel?: boolean;
		nativeButton?: boolean;
		triggerAs?: 'button' | 'span';
		triggerId?: string;
		content?: string;
		triggerLabel?: string;
		css?: string;
		external?: boolean;
		recordStatuses?: boolean;
		hideUnlessEnding?: boolean;
		removeWhenClosed?: boolean;
		onclick?: (event: MouseEvent) => void;
		onOpenChange?: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
	} = $props();

	let statuses = $state<Array<CollapsiblePanelState['transitionStatus']>>([]);
	const customPanel = $derived(recordStatuses || hideUnlessEnding || removeWhenClosed);

	const seen: Array<CollapsiblePanelState['transitionStatus']> = [];

	function record(status: CollapsiblePanelState['transitionStatus']) {
		if (!recordStatuses) return;
		if (seen.at(-1) === status) return;
		seen.push(status);
		// Recording during the snippet render cannot write `$state` directly.
		queueMicrotask(() => {
			statuses = seen.slice();
		});
	}
</script>

{#if css}
	<svelte:element this={"style"}>{css}</svelte:element>
{/if}

{#if external}
	<button type="button" onclick={() => (open = !open)}>toggle externally</button>
{/if}

<Collapsible.Root {disabled} bind:open {onOpenChange}>
	{#if triggerAs === 'span'}
		<Collapsible.Trigger nativeButton={false} disabled={triggerDisabled} {onclick} id={triggerId}>
			{#snippet render(props, _state, triggerChildren)}
				<span {...props}>{@render triggerChildren?.()}</span>
			{/snippet}
			{triggerLabel}
		</Collapsible.Trigger>
	{:else}
		<Collapsible.Trigger {nativeButton} disabled={triggerDisabled} {onclick} id={triggerId}>
			{triggerLabel}
		</Collapsible.Trigger>
	{/if}
	{#if showPanel}
		{#if customPanel}
			<Collapsible.Panel
				{hiddenUntilFound}
				{keepMounted}
				id={panelId}
				class={panelClass}
				style={panelStyle}
				data-testid="panel"
			>
				{#snippet render(props, state, panelChildren)}
					{record(state.transitionStatus)}
					{#if hideUnlessEnding && !state.open && state.transitionStatus !== 'ending'}
						<!-- Panel mounts only once close has entered the ending phase. -->
					{:else if removeWhenClosed && !state.open}
						<!-- Author render drops the panel as soon as it closes. -->
					{:else}
						<div {...props}>{@render panelChildren?.()}</div>
					{/if}
				{/snippet}
				{content}
			</Collapsible.Panel>
		{:else}
			<Collapsible.Panel
				{hiddenUntilFound}
				{keepMounted}
				id={panelId}
				class={panelClass}
				style={panelStyle}
				data-testid="panel"
			>
				{content}
			</Collapsible.Panel>
		{/if}
	{/if}
</Collapsible.Root>

{#if recordStatuses}
	<output data-testid="statuses">{JSON.stringify(statuses)}</output>
{/if}
