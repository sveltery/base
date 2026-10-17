<script lang="ts">
	import { page } from '$app/state';
	import { Checkbox, CheckboxGroup, Field } from '#lib';
	import Shell from '../Shell.svelte';
	import { checkboxGroupForm as f } from '../../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'each';
	const toppings = ['cheese', 'olives'];
	// Kit names every option `toppings[]/<form id>`.
	const name = f.fields.toppings.as('checkbox', 'cheese').name;
</script>

{#snippet box(topping: string, props: Record<string, unknown>)}
	<Field.Item>
		<Field.Label
			><Checkbox.Root
				data-testid="box-{topping}"
				style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
				{...props}><Checkbox.Indicator /></Checkbox.Root
			>{topping}</Field.Label
		>
	</Field.Item>
{/snippet}

<Shell form={f} field="toppings" {name} label="Toppings">
	{#if v === 'group'}
		<!-- One option's `.as()` on the group. -->
		<CheckboxGroup
			data-testid="group"
			{...f.fields.toppings.as('checkbox', 'cheese') as Record<string, unknown>}
		>
			{#each toppings as topping (topping)}{@render box(topping, { value: topping })}{/each}
		</CheckboxGroup>
	{:else if v === 'each'}
		<!-- Each option's `.as()` on its checkbox, inside a group. -->
		<CheckboxGroup data-testid="group">
			{#each toppings as topping (topping)}
				{@render box(topping, f.fields.toppings.as('checkbox', topping))}
			{/each}
		</CheckboxGroup>
	{:else if v === 'each-ungrouped'}
		<!-- Each option's `.as()` on its checkbox, with no group. -->
		<div data-testid="group">
			{#each toppings as topping (topping)}
				{@render box(topping, f.fields.toppings.as('checkbox', topping))}
			{/each}
		</div>
	{/if}
</Shell>
