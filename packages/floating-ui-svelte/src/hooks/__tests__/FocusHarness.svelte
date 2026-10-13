<script lang="ts">
	import { FocusInteraction, type UseFocusProps } from '../useFocus.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let { secondTrigger = false, ...focusProps }: { secondTrigger?: boolean } & UseFocusProps =
		$props();

	export const store = new TestStore();

	const first = new FocusInteraction(store, () => focusProps);
	const second = new FocusInteraction(store, () => focusProps);
</script>

<button data-testid="start">start</button>
<button data-testid="first" {...first.reference} {@attach store.registerTrigger}>first</button>
{#if secondTrigger}
	<button data-testid="second" {...second.reference} {@attach store.registerTrigger}>second</button>
{/if}
<button data-testid="outside">outside</button>
<output data-testid="state" data-open={store.open} data-reason={store.lastReason}>
	{store.domReferenceElement?.getAttribute('data-testid')}
</output>
{#if store.open}
	<div role="tooltip" tabindex="-1" data-testid="floating" {@attach store.registerFloating}>
		tip
	</div>
{/if}
