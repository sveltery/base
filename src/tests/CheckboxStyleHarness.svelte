<script lang="ts">
	import { Checkbox } from '#lib';

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
<Checkbox.Root bind:checked {disabled} {readOnly} required>
	<Checkbox.Indicator data-testid="indicator" />
</Checkbox.Root>
