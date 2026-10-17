<!-- `.as('radio', option)` spread straight onto RadioGroup, with and without a `value` override. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, Radio, RadioGroup } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { radioForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'spread-free';
	const plans = ['free', 'pro'] as const;
	const name = f.fields.plan.as('radio', 'free').name;
</script>

{#snippet options()}
	{#each plans as plan (plan)}
		<Field.Item>
			<Field.Label
				><Radio.Root
					value={plan}
					data-testid="radio-{plan}"
					style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
					><Radio.Indicator /></Radio.Root
				>{plan}</Field.Label
			>
		</Field.Item>
	{/each}
{/snippet}

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(name, f.fields.plan.issues())}>
		<Field.Root data-field="plan">
			<Field.Label>Plan</Field.Label>
			{#if v === 'spread-free'}
				<RadioGroup data-testid="group" {...f.fields.plan.as('radio', 'free')}>
					{@render options()}
				</RadioGroup>
			{:else if v === 'spread-pro'}
				<RadioGroup data-testid="group" {...f.fields.plan.as('radio', 'pro')}>
					{@render options()}
				</RadioGroup>
			{:else if v === 'spread-value'}
				<RadioGroup
					data-testid="group"
					{...f.fields.plan.as('radio', 'free')}
					value={f.fields.plan.value()}
				>
					{@render options()}
				</RadioGroup>
			{:else if v === 'spread-undefined'}
				<RadioGroup data-testid="group" {...f.fields.plan.as('radio', 'free')} value={undefined}>
					{@render options()}
				</RadioGroup>
			{:else if v === 'spread-default'}
				<RadioGroup data-testid="group" {...f.fields.plan.as('radio', 'free')} defaultValue="pro">
					{@render options()}
				</RadioGroup>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
