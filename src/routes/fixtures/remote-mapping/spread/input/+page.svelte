<script lang="ts">
	import { Input } from '#lib';
	import Shell from '../Shell.svelte';
	import { textForm as f } from '../../shared/mapping.remote.js';
</script>

<Shell form={f} field="email" name={f.fields.email.as('email').name} label="Email">
	<Input data-testid="control" {...f.fields.email.as('email')} />
</Shell>
