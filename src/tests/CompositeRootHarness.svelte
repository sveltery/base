<script lang="ts">
	import { flushSync } from 'svelte';
	import { Radio, RadioGroup, Tabs, Toggle, ToggleGroup, Toolbar } from '#lib';
	import type { RadioGroupChangeEventDetails } from '#lib/radio-group/types.js';
	import TabsRegisterProbe from './TabsRegisterProbe.svelte';

	type Scenario =
		| 'toggle-disabled'
		| 'toolbar-disabled'
		| 'radio-disabled'
		| 'tabs-default'
		| 'reorder'
		| 'radio-external'
		| 'tabs-remount'
		| 'tabs-register'
		| 'toolbar-link'
		| 'radio-flush';

	let { scenario }: { scenario: Scenario } = $props();

	let items = $state(['a', 'b', 'c']);
	let selected = $state('a');
	let showTabs = $state(true);
	let tabDisabled = $state(false);
	let registrations = $state(0);
	let linkClicks = $state(0);
	let flushed = $state<string | undefined>(undefined);
	let flushCalls = $state<{ value: string; shiftKey: boolean }[]>([]);

	function recordFlush(next: unknown, details: RadioGroupChangeEventDetails) {
		flushSync(() => {
			flushed = typeof next === 'string' ? next : undefined;
		});
		const event = details.event;
		flushCalls = [
			...flushCalls,
			{
				value: typeof next === 'string' ? next : String(next),
				shiftKey: 'shiftKey' in event && Boolean(event.shiftKey)
			}
		];
	}
</script>

{#if scenario === 'toggle-disabled'}
	<ToggleGroup aria-label="Formatting">
		<Toggle value="a" disabled>A</Toggle>
		<Toggle value="b">B</Toggle>
	</ToggleGroup>
{:else if scenario === 'toolbar-disabled'}
	<Toolbar.Root aria-label="Tools">
		<Toolbar.Button disabled focusableWhenDisabled={false}>A</Toolbar.Button>
		<Toolbar.Button>B</Toolbar.Button>
	</Toolbar.Root>
{:else if scenario === 'radio-disabled'}
	<RadioGroup aria-label="Colors">
		<Radio.Root value="a" disabled>A</Radio.Root>
		<Radio.Root value="b">B</Radio.Root>
	</RadioGroup>
{:else if scenario === 'tabs-default'}
	<Tabs.Root defaultValue="b">
		<Tabs.List>
			<Tabs.Tab value="a">A</Tabs.Tab>
			<Tabs.Tab value="b">B</Tabs.Tab>
			<Tabs.Tab value="c">C</Tabs.Tab>
		</Tabs.List>
	</Tabs.Root>
{:else if scenario === 'reorder'}
	<ToggleGroup aria-label="Items">
		{#each items as item (item)}
			<Toggle value={item}>{item}</Toggle>
		{/each}
	</ToggleGroup>
	<button type="button" onclick={() => (items = ['c', 'b', 'a'])}>Reverse</button>
{:else if scenario === 'radio-external'}
	<button type="button" onclick={() => (selected = 'b')}>Set B</button>
	<RadioGroup aria-label="Colors" bind:value={selected}>
		<Radio.Root value="a">A</Radio.Root>
		<Radio.Root value="b">B</Radio.Root>
	</RadioGroup>
{:else if scenario === 'tabs-remount'}
	<Tabs.Root defaultValue="b">
		<Tabs.List>
			{#if showTabs}
				<Tabs.Tab value="a">A</Tabs.Tab>
				<Tabs.Tab value="b">B</Tabs.Tab>
				<Tabs.Tab value="c">C</Tabs.Tab>
			{/if}
		</Tabs.List>
	</Tabs.Root>
	<button type="button" onclick={() => (showTabs = !showTabs)}>Toggle tabs</button>
{:else if scenario === 'tabs-register'}
	<Tabs.Root defaultValue="a">
		<TabsRegisterProbe bind:count={registrations} />
		<Tabs.List>
			<Tabs.Tab value="a" disabled={tabDisabled}>A</Tabs.Tab>
			<Tabs.Tab value="b">B</Tabs.Tab>
		</Tabs.List>
	</Tabs.Root>
	<button type="button" onclick={() => (tabDisabled = !tabDisabled)}>Disable A</button>
	<p data-testid="registrations">{registrations}</p>
{:else if scenario === 'toolbar-link'}
	<Toolbar.Root aria-label="Tools">
		<Toolbar.Link
			href="#docs"
			onclick={(event) => {
				event.preventDefault();
				linkClicks += 1;
			}}
		>
			Docs
		</Toolbar.Link>
	</Toolbar.Root>
	<p data-testid="clicks">{linkClicks}</p>
{:else if scenario === 'radio-flush'}
	<RadioGroup aria-label="Colors" value={flushed} onValueChange={recordFlush}>
		<Radio.Root value="a">A</Radio.Root>
		<Radio.Root value="b">B</Radio.Root>
	</RadioGroup>
	<p data-testid="flush">{JSON.stringify(flushCalls)}</p>
{/if}
