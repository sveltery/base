<script lang="ts">
	import { Radio } from '#lib';

	let checked = $state(true);
	let disabled = $state(true);
	let readOnly = $state(true);
</script>

<button
	type="button"
	onclick={() => {
		disabled = false;
		readOnly = false;
		checked = false;
	}}>Enable</button
>
<Radio.Root value="a" {checked} {disabled} readonly={readOnly} required aria-label="Radio">
	<Radio.Indicator data-testid="indicator" />
</Radio.Root>
