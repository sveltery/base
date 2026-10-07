<script lang="ts">
	import { Meter } from '#lib';

	let { value, format = undefined }: { value: number; format?: Intl.NumberFormatOptions } =
		$props();
</script>

<Meter.Root {value} {format}>
	<Meter.Value data-testid="value">
		{#snippet children(formatted, raw)}{formatted}|{raw}{/snippet}
	</Meter.Value>
</Meter.Root>
