<script lang="ts">
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import FloatingFocusManager from '../FloatingFocusManager.svelte';
	import { TestStore } from '../../hooks/__tests__/TestStore.svelte.js';

	let { explicitReturnFocus }: { explicitReturnFocus?: boolean } = $props();

	export const store = new TestStore();
</script>

<button
	data-testid="reference"
	{@attach store.registerTrigger}
	onclick={(event) =>
		store.setOpen(true, createChangeEventDetails(REASONS.triggerPress, event, event.currentTarget))}
>
	reference
</button>
<button
	data-testid="close"
	onclick={(event) => store.setOpen(false, createChangeEventDetails(REASONS.none, event))}
>
	close
</button>
{#if store.open}
	<FloatingFocusManager {store} {explicitReturnFocus} modal={false} closeOnFocusOut={false}>
		<div {@attach store.registerFloating}>
			<button data-testid="child">child</button>
		</div>
	</FloatingFocusManager>
{/if}
