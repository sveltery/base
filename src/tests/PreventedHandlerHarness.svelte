<script lang="ts">
	import { Field, NumberField, OTPField, Radio, RadioGroup, Tabs } from '#lib';

	type Handler = (event: Event) => void;

	let {
		part,
		handlers = {},
		stepperHandlers = {},
		onValueChange,
		onValueCommitted,
		validationMode
	}: {
		part: 'field' | 'otp' | 'number' | 'radio' | 'tabs';
		handlers?: Record<string, Handler>;
		stepperHandlers?: Record<string, Handler>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- specs pass typed callbacks for the OTP and number roots
		onValueChange?: (...args: any[]) => void;
		onValueCommitted?: (value: number | null) => void;
		validationMode?: 'onBlur' | 'onChange' | 'onSubmit';
	} = $props();
</script>

{#if part === 'field'}
	<Field.Root data-testid="field" {validationMode} validate={(value) => (value ? null : 'Empty')}>
		<Field.Control data-testid="control" {...handlers} />
		<Field.Error data-testid="error" />
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'otp'}
	<Field.Root data-testid="field">
		<OTPField.Root length={4} name="otp" {onValueChange}>
			{#each [0, 1, 2, 3] as index (index)}
				<OTPField.Input {...handlers} />
			{/each}
		</OTPField.Root>
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'number'}
	<Field.Root data-testid="field">
		<NumberField.Root locale="en-US" name="qty" {onValueChange} {onValueCommitted}>
			<NumberField.Input data-testid="control" {...handlers} />
			<NumberField.Increment {...stepperHandlers} />
		</NumberField.Root>
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'radio'}
	<RadioGroup defaultValue="a">
		<Radio.Root value="a" aria-label="A" style="display: inline-block; width: 16px; height: 16px" />
		<Radio.Root
			value="b"
			aria-label="B"
			style="display: inline-block; width: 16px; height: 16px"
			{...handlers}
		/>
	</RadioGroup>
{:else if part === 'tabs'}
	<Tabs.Root>
		<Tabs.List activateOnFocus>
			<Tabs.Tab value={0}>One</Tabs.Tab>
			<Tabs.Tab value={1} {...handlers}>Two</Tabs.Tab>
		</Tabs.List>
	</Tabs.Root>
{/if}
