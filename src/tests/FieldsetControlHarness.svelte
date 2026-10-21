<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Checkbox, CheckboxGroup, Field, Fieldset, Form, Radio, RadioGroup } from '#lib';
	import { submitTo } from '../routes/fixtures/form-log.js';

	let submitted = $state('');
</script>

<Form onsubmit={submitTo((values) => (submitted = JSON.stringify(values)))}>
	<Field.Root name="storageType">
		<Fieldset.Root>
			{#snippet render(props, _state, children)}
				<RadioGroup {...props as HTMLAttributes<HTMLDivElement>} defaultValue="hdd"
					>{@render children?.()}</RadioGroup
				>
			{/snippet}
			<Fieldset.Legend>Storage type</Fieldset.Legend>
			<Radio.Root value="ssd" aria-label="SSD" />
			<Radio.Root value="hdd" aria-label="HDD" />
		</Fieldset.Root>
	</Field.Root>
	<Field.Root name="protocols">
		<Fieldset.Root>
			{#snippet render(props, _state, children)}
				<CheckboxGroup {...props as HTMLAttributes<HTMLDivElement>} defaultValue={['ssh']}
					>{@render children?.()}</CheckboxGroup
				>
			{/snippet}
			<Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
			<Checkbox.Root value="http" aria-label="HTTP" />
			<Checkbox.Root value="ssh" aria-label="SSH" />
		</Fieldset.Root>
	</Field.Root>
	<button type="submit">Submit</button>
</Form>
<output data-testid="submitted">{submitted}</output>
