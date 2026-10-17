<!-- A Radio Group with its server issue passed at Field level. `?v=` as in ../signup. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, Radio, RadioGroup } from '#lib';
	import FixturePage from '../../../form/shared/FixturePage.svelte';
	import { radioForm } from '../../shared/mapping.remote.js';
	import { radioSchema } from '../../shared/schemas.js';

	const v = page.url.searchParams.get('v') ?? 'match';
	const f = v === 'preflight' ? radioForm.preflight(radioSchema) : radioForm;
	const plan = f.fields.plan.as('radio', 'free');
	const issues = $derived(f.fields.plan.issues());
</script>

<FixturePage debug={f.result ?? null}>
	<Form {...f} oninput={v === 'revalidate' ? () => f.validate() : undefined}>
		<Field.Root
			name={plan.name}
			data-field="plan"
			invalid={v === 'validate' ? undefined : !!issues}
			validate={v === 'validate' ? () => issues?.map((issue) => issue.message) ?? null : undefined}
		>
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
			{#if v === 'validate'}
				<Field.Error data-testid="error" />
			{:else}
				<Field.Error data-testid="error" match={!!issues}>
					{#each issues ?? [] as issue (issue.message)}{issue.message}{/each}
				</Field.Error>
			{/if}
		</Field.Root>
		<button type="submit" disabled={f.pending > 0}>Choose</button>
		{#if f.result}<p data-testid="result">Plan: {f.result.received.plan}</p>{/if}
	</Form>
</FixturePage>
