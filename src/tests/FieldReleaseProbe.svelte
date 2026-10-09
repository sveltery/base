<script lang="ts">
	import { Field } from '#lib';
	import { useFormContext } from '../lib/form/context.js';

	let { seen = $bindable(-1) }: { seen?: number } = $props();

	const form = useFormContext();

	function watch() {
		return () => {
			seen = form.fields.size;
		};
	}
</script>

<Field.Root>
	<Field.Control name="email" defaultValue="ada">
		{#snippet render(props)}
			<span {@attach watch} data-seen={seen}>
				<input {...props} data-testid="control" />
			</span>
		{/snippet}
	</Field.Control>
</Field.Root>
