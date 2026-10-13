<script lang="ts">
	import { DismissInteraction, type PressMode } from '../useDismiss.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let { outsidePressEvent }: { outsidePressEvent: PressMode } = $props();

	export const store = new TestStore();
	store.open = true;
	const dismiss = new DismissInteraction(store, () => ({ outsidePressEvent }));
	const hide = () => (store.open = false);
</script>

<button data-testid="hide" onclick={hide} onpointerdown={hide}>Hide</button>
{#if store.open}
	<div data-testid="popup" {...dismiss.floating} {@attach store.registerFloating}></div>
{/if}
