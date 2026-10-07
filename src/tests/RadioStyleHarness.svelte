<script lang="ts">
	import { Radio } from '#lib';

	let value = $state('');
	let disabled = $state(true);
	let readOnly = $state(true);
</script>

<button
	type="button"
	onclick={() => {
		disabled = false;
		readOnly = false;
		value = 'off';
	}}>Enable</button
>
<Radio.Root {value} {disabled} {readOnly} required>
	<Radio.Indicator data-testid="indicator" />
</Radio.Root>
