<script lang="ts">
	import { useFormContext } from '#lib/form/context.js';

	const form = useFormContext();
</script>

<button type="button" onclick={() => form.clearErrors('a')}>Clear a</button>
<button type="button" onclick={() => form.clearErrors(undefined)}>Clear none</button>
<output data-testid="live-errors">{JSON.stringify(form.errors)}</output>
