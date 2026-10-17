<!-- Radio designs for Kit's `.as('radio', option)`. `?v=` picks the design. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, Radio, RadioGroup } from '#lib';
	import FixturePage from '../form/shared/FixturePage.svelte';
	import { radioGroupProps } from './group-props.js';
	import { plans } from './plans.js';
	import { planForm as f } from './radio.remote.js';

	const v = page.url.searchParams.get('v') ?? 'option';
	const name = f.fields.plan.as('radio', 'free').name;
	const issues = $derived(f.fields.plan.issues());
	const errors = $derived(issues ? { [name]: issues.map((issue) => issue.message) } : {});
	const box = 'display: inline-block; width: 1rem; height: 1rem; border: 1px solid';
</script>

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} {errors}>
		<Field.Root data-field="plan" name={v === 'option-root-name' ? name : undefined}>
			<Field.Label>Plan</Field.Label>
			{#if v === 'option' || v === 'option-root-name'}
				<RadioGroup data-testid="group">
					{#each plans as plan (plan)}
						<Field.Item>
							<Field.Label
								><Radio.Root
									{...f.fields.plan.as('radio', plan)}
									data-testid="radio-{plan}"
									style={box}><Radio.Indicator /></Radio.Root
								>{plan}</Field.Label
							>
						</Field.Item>
					{/each}
				</RadioGroup>
			{:else if v === 'group'}
				<RadioGroup data-testid="group" {...radioGroupProps(f.fields.plan)}>
					{#each plans as plan (plan)}
						<Field.Item>
							<Field.Label
								><Radio.Root value={plan} data-testid="radio-{plan}" style={box}
									><Radio.Indicator /></Radio.Root
								>{plan}</Field.Label
							>
						</Field.Item>
					{/each}
				</RadioGroup>
			{:else if v === 'native'}
				<div data-testid="group">
					{#each plans as plan (plan)}
						<label
							><input
								{...f.fields.plan.as('radio', plan)}
								data-testid="radio-{plan}"
							/>{plan}</label
						>
					{/each}
				</div>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
		<button type="reset">Reset</button>
		<button type="button" onclick={() => f.fields.plan.set('team')}>Set team</button>
	</Form>
</FixturePage>
