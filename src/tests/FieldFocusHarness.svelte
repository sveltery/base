<script lang="ts">
	import { Checkbox, Field, NumberField, OTPField, Radio, RadioGroup, Slider, Switch } from '#lib';

	let {
		control,
		firstMounted = true,
		firstDisabled = false,
		rootDisabled = false,
		range = false,
		itemDisabled = false,
		shrink = false,
		readOnly = false
	}: {
		control:
			| 'input'
			| 'checkbox'
			| 'switch'
			| 'number'
			| 'slider'
			| 'otp'
			| 'otp-slots'
			| 'radio-group'
			| 'radios'
			| 'radio-items'
			| 'radio';
		firstMounted?: boolean;
		firstDisabled?: boolean;
		rootDisabled?: boolean;
		range?: boolean;
		itemDisabled?: boolean;
		/** OTP slots: drop `length` with the first slot, and start with one character. */
		shrink?: boolean;
		readOnly?: boolean;
	} = $props();
</script>

<Field.Root data-testid="root" disabled={rootDisabled}>
	{#if control === 'input'}
		<Field.Label data-testid="label">Name</Field.Label>
		{#if firstMounted}<Field.Control data-testid="first" disabled={firstDisabled} />{/if}
	{:else if control === 'checkbox'}
		{#if firstMounted}<Checkbox.Root data-testid="first" disabled={firstDisabled} />{/if}
	{:else if control === 'switch'}
		{#if firstMounted}<Switch.Root data-testid="first" disabled={firstDisabled} />{/if}
	{:else if control === 'number'}
		{#if firstMounted}
			<NumberField.Root disabled={firstDisabled}>
				<NumberField.Input data-testid="first" />
			</NumberField.Root>
		{/if}
	{:else if control === 'slider'}
		<Slider.Root defaultValue={range ? [20, 40] : 20}>
			<Slider.Control>
				{#if firstMounted}<Slider.Thumb disabled={firstDisabled} />{/if}
				{#if range}<Slider.Thumb />{/if}
			</Slider.Control>
		</Slider.Root>
	{:else if control === 'otp'}
		{#if firstMounted}
			<OTPField.Root length={3} data-testid="first" disabled={firstDisabled}>
				<OTPField.Input />
				<OTPField.Input />
				<OTPField.Input />
			</OTPField.Root>
		{/if}
	{:else if control === 'otp-slots'}
		<OTPField.Root
			length={shrink && !firstMounted ? 2 : 3}
			defaultValue={shrink ? '1' : undefined}
			data-testid="otp"
		>
			{#if firstMounted}<OTPField.Input />{/if}
			<OTPField.Input />
			<OTPField.Input />
		</OTPField.Root>
	{:else if control === 'radio-group'}
		{#if firstMounted}
			<RadioGroup data-testid="first" disabled={firstDisabled}>
				<Radio.Root value="a" data-testid="first-radio" />
			</RadioGroup>
		{/if}
	{:else if control === 'radios'}
		<RadioGroup>
			{#if firstMounted}
				<Radio.Root value="a" data-testid="first-radio" disabled={firstDisabled} />
			{/if}
			<Radio.Root value="b" data-testid="second-radio" />
		</RadioGroup>
	{:else if control === 'radio'}
		<Radio.Root value="a" data-testid="first-radio" disabled={firstDisabled} readonly={readOnly} />
	{:else}
		<RadioGroup>
			<Field.Item disabled={itemDisabled}>
				<Radio.Root value="a" data-testid="first-radio" />
			</Field.Item>
			<Field.Item>
				<Radio.Root value="b" />
			</Field.Item>
		</RadioGroup>
	{/if}
</Field.Root>
<button type="button" data-testid="outside">Outside</button>
