<script lang="ts">
	import { Radio, RadioGroup } from '#lib';

	let {
		disableSecond = false,
		onchange
	}: { disableSecond?: boolean; onchange?: (event: Event) => void } = $props();
</script>

<RadioGroup {onchange}>
	<Radio.Root value="a" aria-label="A" />
	<Radio.Root value="b" aria-label="B" disabled={disableSecond} />
</RadioGroup>
<button type="button">Outside</button>
