<script lang="ts">
	import { Combobox, Field, NumberField, OTPField, Radio, RadioGroup, Select, Switch } from '#lib';

	let {
		scenario
	}: {
		scenario:
			'switch' | 'radio' | 'number-field' | 'otp-field' | 'field-control' | 'select' | 'combobox';
	} = $props();

	const box = 'display: inline-block; width: 16px; height: 16px';
</script>

<Field.Root>
	{#if scenario === 'radio'}
		<RadioGroup>
			<Field.Item>
				<Radio.Root id={null} value="free" data-testid="control" style={box} />
				<Field.Label data-testid="label">Free</Field.Label>
			</Field.Item>
		</RadioGroup>
	{:else}
		<Field.Label data-testid="label">Label</Field.Label>
		{#if scenario === 'switch'}
			<Switch.Root id={null} data-testid="control" style={box} />
		{:else if scenario === 'number-field'}
			<NumberField.Root id={null}>
				<NumberField.Input data-testid="control" />
			</NumberField.Root>
		{:else if scenario === 'otp-field'}
			<OTPField.Root id={null} length={2}>
				<OTPField.Input data-testid="control" />
				<OTPField.Input />
			</OTPField.Root>
		{:else if scenario === 'field-control'}
			<Field.Control id={null} data-testid="control" />
		{:else if scenario === 'select'}
			<Select.Root>
				<Select.Trigger id={null} data-testid="control"><Select.Value /></Select.Trigger>
			</Select.Root>
		{:else}
			<Combobox.Root items={['apple']}>
				<Combobox.Trigger id={null} data-testid="control" />
			</Combobox.Root>
		{/if}
	{/if}
</Field.Root>
