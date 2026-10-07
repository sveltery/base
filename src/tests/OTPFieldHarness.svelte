<script lang="ts">
	import { Field, Form, OTPField } from '#lib';
	import type { OTPFieldChangeEventDetails } from '#lib/otp-field/types.js';

	let {
		scenario = 'plain',
		onValueChange,
		onValueInvalid,
		onValueComplete,
		normalizeValue
	}: {
		scenario?: string;
		onValueChange?: (value: string, details: OTPFieldChangeEventDetails) => void;
		onValueInvalid?: (value: string, details: { reason: string }) => void;
		onValueComplete?: (value: string, details: { reason: string }) => void;
		normalizeValue?: (value: string) => string;
	} = $props();

	let bound = $state('');
	let submitted = $state(0);
	let counts = $state(0);

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		details.event.preventDefault();
		submitted += 1;
		counts = Object.keys(formValues).length;
	}
</script>

{#if scenario === 'plain'}
	<OTPField.Root length={6} {onValueChange} {onValueInvalid} {onValueComplete} {normalizeValue}>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'default'}
	<OTPField.Root
		length={6}
		defaultValue="12a34b56"
		data-testid="root"
		{onValueChange}
		{onValueInvalid}
		{onValueComplete}
	>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'overlong'}
	<OTPField.Root
		length={6}
		defaultValue="12a34b56c7"
		name="otp"
		{onValueChange}
		{onValueInvalid}
		{onValueComplete}
	>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'grouped'}
	<OTPField.Root length={6} defaultValue="123456" data-testid="root">
		<div data-testid="first-group">
			<OTPField.Input />
			<OTPField.Input />
			<OTPField.Input />
		</div>
		<OTPField.Separator>-</OTPField.Separator>
		<div data-testid="second-group">
			<OTPField.Input />
			<OTPField.Input />
			<OTPField.Input />
		</div>
	</OTPField.Root>
{:else if scenario === 'alpha'}
	<OTPField.Root length={6} validationType="alpha" defaultValue="1a2b3Cd4">
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'alphanumeric'}
	<OTPField.Root length={6} validationType="alphanumeric" name="otp">
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'none'}
	<OTPField.Root length={6} validationType="none" name="otp" inputMode="numeric" {normalizeValue}>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'bound'}
	<OTPField.Root length={6} bind:value={bound} {onValueChange}>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
	<output data-testid="value">{bound}</output>
	<button type="button" onclick={() => (bound = '654321')}>Apply value</button>
{:else if scenario === 'disabled'}
	<OTPField.Root length={6} disabled data-testid="root" {onValueChange}>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'readonly'}
	<OTPField.Root
		length={6}
		readOnly
		defaultValue="123456"
		data-testid="root"
		{onValueChange}
		{onValueInvalid}
		{onValueComplete}
	>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'mask'}
	<OTPField.Root length={6} mask>
		<OTPField.Input />
		<OTPField.Input type="text" />
	</OTPField.Root>
{:else if scenario === 'labelled'}
	<Field.Root>
		<Field.Label data-testid="label">Verification code</Field.Label>
		<Field.Description data-testid="description">Enter the code.</Field.Description>
		<OTPField.Root length={6} aria-describedby="external-description">
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</Field.Root>
{:else if scenario === 'explicit-label'}
	<span id="label-id">Verification code</span>
	<OTPField.Root length={6} aria-labelledby="label-id">
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input aria-label="Digit" />
		{/each}
	</OTPField.Root>
{:else if scenario === 'native-label'}
	<label>
		Verification code
		<OTPField.Root length={6}>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</label>
{:else if scenario === 'rtl'}
	<div dir="rtl">
		<OTPField.Root length={6} defaultValue="123456">
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</div>
{:else if scenario === 'blur-validate'}
	<Form>
		<Field.Root
			name="otp"
			validationMode="onBlur"
			validate={() => {
				counts += 1;
				return null;
			}}
		>
			<OTPField.Root length={6} validationType="none">
				{#each [0, 1, 2, 3, 4, 5] as index (index)}
					<OTPField.Input />
				{/each}
			</OTPField.Root>
		</Field.Root>
	</Form>
	<button type="button">Outside</button>
	<output data-testid="counts">{counts}</output>
{:else if scenario === 'form-incomplete'}
	<form data-testid="form">
		<OTPField.Root length={6} defaultValue="123" name="otp" required>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'form-complete'}
	<form data-testid="form">
		<OTPField.Root length={6} defaultValue="123456" name="otp" required>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'autosubmit'}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			submitted += 1;
		}}
	>
		<OTPField.Root length={6} name="otp" required autoSubmit {onValueComplete}>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'external-form'}
	<form
		id="verification-form"
		onsubmit={(event) => {
			event.preventDefault();
			submitted += 1;
		}}
	>
		<button type="submit">Submit</button>
	</form>
	<OTPField.Root form="verification-form" name="otp" length={6} autoSubmit>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'not-a-form'}
	<div id="verification-form"></div>
	<form
		onsubmit={(event) => {
			event.preventDefault();
			submitted += 1;
		}}
	>
		<OTPField.Root form="verification-form" name="otp" length={6} autoSubmit>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'named'}
	<OTPField.Root length={6} id="verification-code">
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'mismatch'}
	<OTPField.Root length={6}>
		<OTPField.Input />
	</OTPField.Root>
{:else if scenario === 'bad-length'}
	<OTPField.Root length={0}>
		<OTPField.Input />
	</OTPField.Root>
{:else if scenario === 'required-field'}
	<Form onFormSubmit={accept}>
		<Field.Root name="otp">
			<OTPField.Root length={6} required>
				{#each [0, 1, 2, 3, 4, 5] as index (index)}
					<OTPField.Input />
				{/each}
			</OTPField.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'cancel'}
	<OTPField.Root
		length={6}
		{onValueComplete}
		onValueChange={(_value, details) => {
			details.cancel();
			onValueChange?.(_value, details);
		}}
	>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'orphan'}
	<OTPField.Input />
{/if}
