<script lang="ts">
	import { OTPField } from '#lib';
	import Shell from '../Shell.svelte';
	import { otpForm as f } from '../spread.remote.js';
</script>

<Shell form={f} field="code" name={f.fields.code.as('text').name} label="Code">
	<OTPField.Root length={6} {...f.fields.code.as('text')}>
		{#each { length: 6 }, index (index)}<OTPField.Input data-testid="digit-{index}" />{/each}
	</OTPField.Root>
</Shell>
