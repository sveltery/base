<script lang="ts">
	import { ClickInteraction, type UseClickProps } from '../useClick.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let props: UseClickProps = $props();

	export const store = new TestStore();
	const click = new ClickInteraction(store, () => props);
</script>

<button data-testid="trigger" {...click.reference} {@attach store.registerTrigger}>trigger</button>
