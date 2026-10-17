<script lang="ts">
	import { Checkbox } from '#lib';
	import Shell from '../Shell.svelte';
	import { checkboxForm as f } from '../../shared/mapping.remote.js';
</script>

<Shell form={f} field="agree" name={f.fields.agree.as('checkbox').name} label="Agree">
	<Checkbox.Root
		data-testid="control"
		style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
		{...f.fields.agree.as('checkbox')}><Checkbox.Indicator /></Checkbox.Root
	>
</Shell>
