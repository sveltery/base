<script lang="ts">
	import { Accordion, type AccordionRootChangeEventDetails } from '#lib';
	import type { AccordionCase } from './cases.js';

	let { scenario }: { scenario: AccordionCase } = $props();

	let value = $state<unknown[]>(scenario === 'open' ? ['one'] : []);
	let calls = $state<{ value: unknown[]; reason: string; canceled: boolean }[]>([]);

	function changed(next: unknown[], details: AccordionRootChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ value: next, reason: details.reason, canceled: details.isCanceled });
	}

	function clicked(event: MouseEvent) {
		if (scenario === 'prevented') event.preventDefault();
	}

	const multiple = $derived(scenario === 'multiple');
	const disabled = $derived(scenario === 'disabled');
	const keepMounted = $derived(scenario === 'mounted' || scenario === 'search');
	const hiddenUntilFound = $derived(scenario === 'search');
</script>

{#if scenario === 'bound'}
	<input
		type="checkbox"
		aria-label="Owner one"
		checked={value.includes('one')}
		onchange={() => {
			value = value.includes('one') ? [] : ['one'];
		}}
	/>
{/if}

{#if scenario === 'bound'}
	<Accordion.Root bind:value data-testid="root" onValueChange={changed}>
		<Accordion.Item value="one">
			<Accordion.Header>
				<Accordion.Trigger onclick={clicked}>One</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel data-testid="panel-one">Panel one</Accordion.Panel>
		</Accordion.Item>
		<Accordion.Item value="two">
			<Accordion.Header>
				<Accordion.Trigger>Two</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel data-testid="panel-two">Panel two</Accordion.Panel>
		</Accordion.Item>
	</Accordion.Root>
{:else}
	<Accordion.Root
		value={scenario === 'open' ? value : undefined}
		{multiple}
		{disabled}
		{keepMounted}
		{hiddenUntilFound}
		data-testid="root"
		onValueChange={changed}
	>
		<Accordion.Item value="one">
			<Accordion.Header>
				<Accordion.Trigger onclick={clicked}>One</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel data-testid="panel-one">Panel one</Accordion.Panel>
		</Accordion.Item>
		<Accordion.Item value="two">
			<Accordion.Header>
				<Accordion.Trigger>Two</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel data-testid="panel-two">Panel two</Accordion.Panel>
		</Accordion.Item>
	</Accordion.Root>
{/if}

<output data-testid="calls">{JSON.stringify(calls)}</output>
