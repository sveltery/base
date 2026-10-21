<script lang="ts">
	import { Checkbox, Field, NumberField, OTPField, Radio, RadioGroup, Switch, Tabs } from '#lib';

	type Handler = (event: Event) => void;

	let {
		part,
		handlers = {},
		stepperHandlers = {},
		onValueChange,
		oninput,
		onchange,
		validationMode
	}: {
		part:
			| 'field'
			| 'label'
			| 'otp'
			| 'number'
			| 'scrub'
			| 'checkbox'
			| 'switch'
			| 'radio'
			| 'lone-radio'
			| 'radio-group'
			| 'tabs';
		handlers?: Record<string, Handler>;
		stepperHandlers?: Record<string, Handler>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- specs pass typed callbacks for the OTP root
		onValueChange?: (...args: any[]) => void;
		/** The number field's hidden input handlers. */
		oninput?: Handler;
		onchange?: Handler;
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
		<NumberField.Root locale="en-US" name="qty" {oninput} {onchange}>
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
{:else if part === 'label'}
	<Field.Root>
		<Field.Label nativeLabel={false} {...handlers}>
			{#snippet render(props)}
				<span {...props}>Email</span>
			{/snippet}
		</Field.Label>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if part === 'scrub'}
	<NumberField.Root locale="en-US" defaultValue={0}>
		<NumberField.ScrubArea
			data-testid="scrub"
			style="display: inline-block; width: 100px; height: 40px"
			{...handlers}
		/>
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if part === 'checkbox'}
	<Field.Root data-testid="field">
		<Checkbox.Root
			aria-label="Check"
			style="display: inline-block; width: 16px; height: 16px"
			{...handlers}
		/>
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'switch'}
	<Field.Root data-testid="field">
		<Switch.Root
			aria-label="Toggle"
			style="display: inline-block; width: 16px; height: 16px"
			{...handlers}
		/>
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'lone-radio'}
	<Field.Root data-testid="field">
		<Radio.Root
			value="a"
			aria-label="A"
			style="display: inline-block; width: 16px; height: 16px"
			{...handlers}
		/>
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'radio-group'}
	<Field.Root data-testid="field">
		<RadioGroup defaultValue="a" {...handlers}>
			<Radio.Root
				value="a"
				aria-label="A"
				style="display: inline-block; width: 16px; height: 16px"
			/>
		</RadioGroup>
	</Field.Root>
	<button type="button">After</button>
{:else if part === 'tabs'}
	<Tabs.Root>
		<Tabs.List activateOnFocus>
			<Tabs.Tab value={0}>One</Tabs.Tab>
			<Tabs.Tab value={1} {...handlers}>Two</Tabs.Tab>
		</Tabs.List>
	</Tabs.Root>
{/if}
