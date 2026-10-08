<script lang="ts">
	import {
		Accordion,
		type AccordionItemChangeEventDetails,
		type AccordionItemState,
		type AccordionRootChangeEventDetails
	} from '#lib';

	export type HarnessItem = {
		value?: unknown;
		omitValue?: boolean;
		disabled?: boolean;
		triggerDisabled?: boolean;
		passTriggerDisabled?: boolean;
		label?: string;
		content?: string;
		panelId?: string;
		triggerId?: string;
		keepMounted?: boolean;
		hiddenUntilFound?: boolean;
		passKeepMounted?: boolean;
		passHiddenUntilFound?: boolean;
		nativeButton?: boolean;
		triggerAs?: 'button' | 'span';
		showTrigger?: boolean;
		showPanel?: boolean;
		testId?: string;
		panelTestId?: string;
		panelClass?: string;
		panelStyle?: string;
	};

	let {
		value = $bindable(undefined),
		bound = false,
		multiple = false,
		disabled = false,
		hiddenUntilFound = false,
		keepMounted = undefined,
		orientation = 'vertical',
		items = [{ value: 0, label: 'Trigger 1', content: 'Panel contents 1' }],
		css = '',
		recordState = false,
		showValueControls = false,
		showIdControls = false,
		onValueChange = undefined,
		onOpenChange = undefined
	}: {
		value?: unknown[];
		bound?: boolean;
		multiple?: boolean;
		disabled?: boolean;
		hiddenUntilFound?: boolean;
		keepMounted?: boolean;
		orientation?: 'horizontal' | 'vertical';
		items?: HarnessItem[];
		css?: string;
		recordState?: boolean;
		showValueControls?: boolean;
		showIdControls?: boolean;
		onValueChange?: (value: unknown[], details: AccordionRootChangeEventDetails) => void;
		onOpenChange?: (open: boolean, details: AccordionItemChangeEventDetails) => void;
	} = $props();

	let triggerIdOverride = $state<string | undefined>(undefined);
	let idOverrideActive = $state(false);
	let sawOpen = $state(false);
	let sawHiddenWhileOpen = $state(false);

	function record(state: AccordionItemState) {
		if (!recordState) return;
		if (state.open && state.hidden) {
			queueMicrotask(() => {
				sawHiddenWhileOpen = true;
			});
		}
		if (state.open) {
			queueMicrotask(() => {
				sawOpen = true;
			});
		}
	}
</script>

{#if css}
	<svelte:element this={"style"}>{css}</svelte:element>
{/if}

{#if showValueControls}
	<button type="button" onclick={() => (value = [0])}>Set open</button>
	<button type="button" onclick={() => (value = [])}>Set closed</button>
{/if}

{#if showIdControls}
	<button
		type="button"
		onclick={() => {
			idOverrideActive = true;
			triggerIdOverride = 'custom-trigger-id-1';
		}}>Set id 1</button
	>
	<button
		type="button"
		onclick={() => {
			idOverrideActive = true;
			triggerIdOverride = 'custom-trigger-id-2';
		}}>Set id 2</button
	>
	<button
		type="button"
		onclick={() => {
			idOverrideActive = true;
			triggerIdOverride = undefined;
		}}>Remove id</button
	>
{/if}

{#snippet itemBody(item: HarnessItem, index: number)}
	<Accordion.Header>
		{#if item.showTrigger !== false}
			{#if item.triggerAs === 'span'}
				<Accordion.Trigger
					nativeButton={false}
					disabled={item.passTriggerDisabled ? item.triggerDisabled : undefined}
					id={showIdControls && index === 0 && idOverrideActive
						? triggerIdOverride
						: item.triggerId}
				>
					{#snippet render(props, _state, triggerChildren)}
						<span {...props}>{@render triggerChildren?.()}</span>
					{/snippet}
					{item.label ?? `Trigger ${index + 1}`}
				</Accordion.Trigger>
			{:else}
				<Accordion.Trigger
					nativeButton={item.nativeButton ?? true}
					disabled={item.passTriggerDisabled ? item.triggerDisabled : undefined}
					id={showIdControls && index === 0 && idOverrideActive
						? triggerIdOverride
						: item.triggerId}
				>
					{item.label ?? `Trigger ${index + 1}`}
				</Accordion.Trigger>
			{/if}
		{/if}
	</Accordion.Header>
	{#if item.showPanel !== false}
		<Accordion.Panel
			id={item.panelId}
			class={item.panelClass}
			style={item.panelStyle}
			data-testid={item.panelTestId ?? (index === 0 ? 'panel' : `panel-${index + 1}`)}
			keepMounted={item.passKeepMounted ? item.keepMounted : undefined}
			hiddenUntilFound={item.passHiddenUntilFound ? item.hiddenUntilFound : undefined}
		>
			{item.content ?? `Panel contents ${index + 1}`}
		</Accordion.Panel>
	{/if}
{/snippet}

{#snippet body()}
	{#each items as item, index (index)}
		{#if recordState && index === 0}
			<Accordion.Item
				value={item.omitValue ? undefined : item.value}
				disabled={item.disabled ?? false}
				data-testid={item.testId}
				{onOpenChange}
			>
				{#snippet render(props, state, itemChildren)}
					{record(state)}
					<div {...props}>{@render itemChildren?.()}</div>
				{/snippet}
				{@render itemBody(item, index)}
			</Accordion.Item>
		{:else}
			<Accordion.Item
				value={item.omitValue ? undefined : item.value}
				disabled={item.disabled ?? false}
				data-testid={item.testId}
				{onOpenChange}
			>
				{@render itemBody(item, index)}
			</Accordion.Item>
		{/if}
	{/each}
{/snippet}

{#if bound}
	<Accordion.Root
		bind:value
		{multiple}
		{disabled}
		{hiddenUntilFound}
		{keepMounted}
		{orientation}
		{onValueChange}
		data-testid="root"
	>
		{@render body()}
	</Accordion.Root>
{:else}
	<Accordion.Root
		{value}
		{multiple}
		{disabled}
		{hiddenUntilFound}
		{keepMounted}
		{orientation}
		{onValueChange}
		data-testid="root"
	>
		{@render body()}
	</Accordion.Root>
{/if}

{#if recordState}
	<output data-testid="state-log" data-saw-open={sawOpen} data-saw-bad={sawHiddenWhileOpen}
	></output>
{/if}
