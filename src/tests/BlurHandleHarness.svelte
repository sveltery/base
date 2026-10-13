<script lang="ts">
	import { Checkbox, Field } from '#lib';
	import type { FieldHandle } from '../lib/form/source.js';

	let { handle, control }: { handle: FieldHandle; control: 'input' | 'checkbox' } = $props();
</script>

{#if control === 'input'}
	<Field.Root field={handle}>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else}
	<Field.Root field={handle} type="checkbox">
		<Checkbox.Root data-testid="control" style="display: inline-block; width: 16px; height: 16px" />
	</Field.Root>
{/if}
<button>Elsewhere</button>
