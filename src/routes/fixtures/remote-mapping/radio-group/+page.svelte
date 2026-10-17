<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, Radio, RadioGroup } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { radioForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'group-name';
	const plans = ['free', 'pro'] as const;
	// Every radio option shares one name, so any option's `.as()` gives it.
	const name = f.fields.plan.as('radio', 'free').name;
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(name, f.fields.plan.issues())}>
		<Field.Root data-field="plan" name={v === 'root-name' ? name : undefined}>
			<Field.Label>Plan</Field.Label>
			{#if v === 'root-name'}
				<RadioGroup>
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
				</RadioGroup>
			{:else if v === 'group-name'}
				<RadioGroup {name}>
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
				</RadioGroup>
			{:else if v === 'spread'}
				<RadioGroup>
					{#each plans as plan (plan)}
						<Field.Item>
							<Field.Label
								><Radio.Root
									{...f.fields.plan.as('radio', plan)}
									value={plan}
									data-testid="radio-{plan}"
									style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
									><Radio.Indicator /></Radio.Root
								>{plan}</Field.Label
							>
						</Field.Item>
					{/each}
				</RadioGroup>
			{:else if v === 'controlled'}
				<RadioGroup
					{name}
					value={f.fields.plan.value() ?? null}
					onValueChange={(value) => f.fields.plan.set(value as (typeof plans)[number])}
				>
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
				</RadioGroup>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
