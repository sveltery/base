<script lang="ts">
	import { Radio, RadioGroup } from '#lib';

	let {
		disableSecond = false,
		onValueChange
	}: { disableSecond?: boolean; onValueChange?: (value: unknown) => void } = $props();
</script>

<RadioGroup {onValueChange}>
	<Radio.Root value="a" aria-label="A" />
	<Radio.Root value="b" aria-label="B" disabled={disableSecond} />
</RadioGroup>
<button type="button">Outside</button>
