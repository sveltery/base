<script lang="ts">
	import { Field, Radio, RadioGroup } from '#lib';
	import Shell from '../Shell.svelte';
	import { radioForm as f } from '../../shared/mapping.remote.js';

	const plans = ['free', 'pro'] as const;
</script>

<Shell form={f} field="plan" name={f.fields.plan.as('radio', 'free').name} label="Plan">
	<RadioGroup
		data-testid="control"
		{...f.fields.plan.as('radio', 'free')}
		value={f.fields.plan.value()}
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
</Shell>
