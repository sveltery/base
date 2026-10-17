<!-- A Radio Group written straight from mapping-table.md, with no helper. -->
<script lang="ts">
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import { Field, Form, Radio, RadioGroup } from '#lib';
	import { radioForm as f } from '../../shared/mapping.remote.js';

	// Every option shares one name, so any option's `.as()` gives it.
	const plan = f.fields.plan.as('radio', 'free');
</script>

<FixturePage debug={f.result ?? null}>
	<Form
		{...f}
		errors={{ [plan.name]: f.fields.plan.issues()?.map((issue) => issue.message) ?? [] }}
	>
		<Field.Root name={plan.name} data-field="plan">
			<Field.Label>Plan</Field.Label>
			<RadioGroup defaultValue={f.fields.plan.value()}>
				{#each ['free', 'pro'] as option (option)}
					<Field.Item>
						<Field.Label
							><Radio.Root value={option}><Radio.Indicator /></Radio.Root>{option}</Field.Label
						>
					</Field.Item>
				{/each}
			</RadioGroup>
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit" disabled={f.pending > 0}>Choose</button>
		{#if f.result}<p data-testid="result">Plan: {f.result.received.plan}</p>{/if}
	</Form>
</FixturePage>
