<script lang="ts">
	import { untrack } from 'svelte';
	import { Tabs, type TabsRootChangeEventDetails, type TabsTabState } from '#lib';

	export type HarnessTab = {
		value: unknown;
		label: string;
		disabled?: boolean;
		hidden?: boolean;
		native?: boolean;
		panel?: string;
	};

	let {
		value = $bindable(undefined),
		passValue = false,
		bind = false,
		orientation = 'horizontal',
		activateOnFocus = false,
		loopFocus = true,
		keepMounted = false,
		dir = 'ltr',
		tabs = [
			{ value: 0, label: 'One', panel: 'Panel one' },
			{ value: 1, label: 'Two', panel: 'Panel two' }
		],
		showIndicator = false,
		custom = false,
		attach = false,
		nested = false,
		omitPanels = false,
		nativeButton = true,
		record = true,
		onValueChange = undefined
	}: {
		value?: unknown;
		passValue?: boolean;
		bind?: boolean;
		orientation?: 'horizontal' | 'vertical';
		activateOnFocus?: boolean;
		loopFocus?: boolean;
		keepMounted?: boolean;
		dir?: 'ltr' | 'rtl';
		tabs?: HarnessTab[];
		showIndicator?: boolean;
		custom?: boolean;
		attach?: boolean;
		nested?: boolean;
		omitPanels?: boolean;
		nativeButton?: boolean;
		record?: boolean;
		onValueChange?: (value: unknown, details: TabsRootChangeEventDetails) => void;
	} = $props();

	let calls = $state<{ value: unknown; reason: string; canceled: boolean; direction: string }[]>(
		[]
	);
	let attached = $state('none');
	const initialTabs = untrack(() => tabs);
	let shown = $state<boolean[]>(initialTabs.map(() => true));
	let disabled = $state<boolean[]>(initialTabs.map((tab) => tab.disabled ?? false));
	let held = $state(value);

	function log(next: unknown, details: TabsRootChangeEventDetails) {
		onValueChange?.(next, details);
		calls = [
			...calls,
			{
				value: next,
				reason: details.reason,
				canceled: details.isCanceled,
				direction: details.activationDirection
			}
		];
	}

	function capture(node: HTMLElement) {
		attached = node.textContent ?? 'empty';
		return () => {
			attached = 'none';
		};
	}
</script>

<div {dir}>
	<button type="button" onclick={() => (held = 0)}>Set zero</button>
	<button type="button" onclick={() => (held = null)}>Clear value</button>
	<button type="button" onclick={() => (disabled[0] = true)}>Disable first</button>
	<button type="button" onclick={() => (shown[1] = false)}>Remove second</button>
	<button type="button" onclick={() => (shown[0] = false)}>Remove first</button>

	{#if bind}
		<Tabs.Root bind:value={held} {orientation} onValueChange={record ? log : undefined}>
			{@render body()}
		</Tabs.Root>
	{:else if passValue}
		<Tabs.Root value={held} {orientation} onValueChange={record ? log : undefined}>
			{@render body()}
		</Tabs.Root>
	{:else}
		<Tabs.Root {orientation} onValueChange={record ? log : undefined}>
			{@render body()}
		</Tabs.Root>
	{/if}
</div>

{#snippet body()}
	<Tabs.List aria-label="Sections" {activateOnFocus} {loopFocus}>
		{#each tabs as tab, index (String(tab.value))}
			{#if shown[index]}
				{#if custom && index === 0}
					<Tabs.Tab value={tab.value} disabled={disabled[index]}>
						{#snippet render(props, tabState: TabsTabState, children)}
							<button {...props} data-testid="custom" data-active-state={tabState.active}
								>{@render children()}</button
							>
						{/snippet}
						{tab.label}
					</Tabs.Tab>
				{:else if attach && index === 0}
					<Tabs.Tab value={tab.value} {@attach capture}>{tab.label}</Tabs.Tab>
				{:else if tab.native === false}
					<Tabs.Tab value={tab.value} nativeButton={false} disabled={disabled[index]}>
						{#snippet render(props, _state, children)}
							<a {...props} href="#{tab.label}">{@render children()}</a>
						{/snippet}
						{tab.label}
					</Tabs.Tab>
				{:else}
					<Tabs.Tab
						value={tab.value}
						disabled={disabled[index]}
						{...tab.hidden ? { hidden: true } : {}}
						{nativeButton}
					>
						{tab.label}
					</Tabs.Tab>
				{/if}
			{/if}
		{/each}
		{#if showIndicator}
			<Tabs.Indicator data-testid="indicator" />
		{/if}
	</Tabs.List>
	{#if !omitPanels}
		{#each tabs as tab, index (String(tab.value))}
			<Tabs.Panel value={tab.value} {keepMounted} data-testid={'panel-' + index}>
				{tab.panel ?? tab.label}
			</Tabs.Panel>
		{/each}
	{/if}
	{#if nested}
		<Tabs.Panel value={tabs[0]?.value}>
			<Tabs.Root value="inner-a">
				<Tabs.List aria-label="Nested">
					<Tabs.Tab value="inner-a">Inner A</Tabs.Tab>
					<Tabs.Tab value="inner-b">Inner B</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="inner-a">Nested A</Tabs.Panel>
				<Tabs.Panel value="inner-b">Nested B</Tabs.Panel>
			</Tabs.Root>
		</Tabs.Panel>
	{/if}
{/snippet}

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="attached">{attached}</output>
<output data-testid="held">{JSON.stringify(held)}</output>
