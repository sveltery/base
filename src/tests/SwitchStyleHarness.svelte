<script lang="ts">
	import { Switch } from '#lib';

	let checked = $state(true);
	let disabled = $state(true);
	let readOnly = $state(true);
</script>

<button
	type="button"
	onclick={() => {
		disabled = false;
		readOnly = false;
	}}>Enable</button
>
<Switch.Root bind:checked {disabled} {readOnly} required>
	<Switch.Thumb data-testid="thumb" />
</Switch.Root>
