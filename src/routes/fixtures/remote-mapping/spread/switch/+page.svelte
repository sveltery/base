<script lang="ts">
	import { Switch } from '#lib';
	import Shell from '../Shell.svelte';
	import { switchForm as f } from '../../shared/mapping.remote.js';
</script>

<Shell form={f} field="notify" name={f.fields.notify.as('checkbox').name} label="Notify">
	<Switch.Root
		data-testid="control"
		style="display: inline-block; width: 1rem; height: 1rem; border: 1px solid"
		{...f.fields.notify.as('checkbox')}><Switch.Thumb /></Switch.Root
	>
</Shell>
