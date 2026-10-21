<!-- A RadioGroup named by a legend inside it, with a remote form spread on each Radio. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Field, Fieldset, Form, Radio, RadioGroup } from '#lib';

	const f = {} as RemoteForm<{ plan: 'free' | 'pro' }, unknown>;
</script>

<Form form={f}>
	<Field.Root name="plan">
		<RadioGroup>
			<Fieldset.Legend>Plan</Fieldset.Legend>
			<Field.Item>
				<Radio.Root {...f.fields.plan.as('radio', 'free')} />
				<Field.Label>Free</Field.Label>
			</Field.Item>
			<Field.Item>
				<Radio.Root {...f.fields.plan.as('radio', 'pro')} />
				<Field.Label>Pro</Field.Label>
			</Field.Item>
		</RadioGroup>
		<Field.Error />
	</Field.Root>
</Form>
