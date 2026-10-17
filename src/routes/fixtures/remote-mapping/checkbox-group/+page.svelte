<script lang="ts">
	import { page } from '$app/state';
	import { Checkbox, CheckboxGroup, Field, Form } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { checkboxGroupForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'name';
	const toppings = ['cheese', 'olives'];
	// Kit names every option `toppings[]/<form id>`.
	const name = f.fields.toppings.as('checkbox', 'cheese').name;
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(name, f.fields.toppings.issues())}>
		<Field.Root data-field="toppings" name={v === 'root-name' ? name : undefined}>
			<Field.Label>Toppings</Field.Label>
			{#if v === 'root-name'}
				<CheckboxGroup>
					{#each toppings as topping (topping)}
						<Field.Item>
							<Field.Label
								><Checkbox.Root
									value={topping}
									data-testid="box-{topping}"
									style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
									><Checkbox.Indicator /></Checkbox.Root
								>{topping}</Field.Label
							>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			{:else if v === 'name'}
				<CheckboxGroup>
					{#each toppings as topping (topping)}
						<Field.Item>
							<Field.Label
								><Checkbox.Root
									{name}
									value={topping}
									data-testid="box-{topping}"
									style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
									><Checkbox.Indicator /></Checkbox.Root
								>{topping}</Field.Label
							>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			{:else if v === 'spread'}
				<CheckboxGroup>
					{#each toppings as topping (topping)}
						<Field.Item>
							<Field.Label
								><Checkbox.Root
									{...f.fields.toppings.as('checkbox', topping)}
									data-testid="box-{topping}"
									style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
									><Checkbox.Indicator /></Checkbox.Root
								>{topping}</Field.Label
							>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			{:else if v === 'controlled'}
				<CheckboxGroup
					value={(f.fields.toppings.value() ?? []) as string[]}
					onValueChange={(value) => f.fields.toppings.set(value)}
				>
					{#each toppings as topping (topping)}
						<Field.Item>
							<Field.Label
								><Checkbox.Root
									{name}
									value={topping}
									data-testid="box-{topping}"
									style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
									><Checkbox.Indicator /></Checkbox.Root
								>{topping}</Field.Label
							>
						</Field.Item>
					{/each}
				</CheckboxGroup>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
