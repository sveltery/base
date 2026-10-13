<script lang="ts">
	import { Field } from '#lib';

	let { defaultValue }: { defaultValue: string } = $props();
</script>

<Field.Root data-testid="root">
	<Field.Control {defaultValue} />
</Field.Root>
