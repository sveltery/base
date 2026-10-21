<!-- Radios in a Form on a stand-in remote form whose `as('radio', option)` answers like Kit's. -->
<script lang="ts">
	import { Field, Form, Radio, RadioGroup } from '#lib';

	let {
		scenario,
		plan = 'pro'
	}: {
		scenario: 'bare' | 'own-name' | 'unnamed';
		plan?: string;
	} = $props();

	const box = 'display: inline-block; width: 16px; height: 16px';

	function node(path: string[]): unknown {
		return new Proxy(
			{},
			{
				get(_, key) {
					if (key === 'allIssues' || key === 'issues') return () => [];
					if (key === 'value') return () => (path.join('.') === 'plan' ? plan : undefined);
					if (key === 'as') {
						return (type: string, option?: string) => ({
							name: path.join('.'),
							type,
							value: option,
							checked: path.join('.') === 'plan' && option === plan
						});
					}
					if (typeof key === 'symbol') return undefined;
					return node([...path, key]);
				}
			}
		);
	}

	const remote = {
		method: 'POST' as const,
		action: '?/remote=form',
		fields: node([]),
		pending: 0,
		submitted: false
	};
</script>

<Form form={remote}>
	{#if scenario === 'unnamed'}
		<RadioGroup aria-label="Plan">
			<Radio.Root value="free" aria-label="Free" style={box} />
			<Radio.Root value="pro" aria-label="Pro" style={box} />
		</RadioGroup>
	{:else}
		<Field.Root name="plan">
			<RadioGroup aria-label="Plan">
				<Radio.Root value="free" aria-label="Free" style={box} />
				<Radio.Root
					value="pro"
					aria-label="Pro"
					style={box}
					name={scenario === 'own-name' ? 'other' : undefined}
				/>
			</RadioGroup>
		</Field.Root>
	{/if}
</Form>
