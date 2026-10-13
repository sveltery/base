<script lang="ts">
	import type { FloatingTreeStore } from '../../components/FloatingTreeStore.js';
	import type { HandleClose } from '../../safePolygon.js';
	import { HoverReferenceInteraction } from '../useHoverReferenceInteraction.svelte.js';
	import { TestStore } from './TestStore.svelte.js';

	let {
		restMs = 0,
		move = true,
		handleClose = null,
		externalTree
	}: {
		restMs?: number;
		move?: boolean;
		handleClose?: HandleClose | null;
		externalTree?: FloatingTreeStore;
	} = $props();

	export const store = new TestStore();
	const options = () => ({ restMs, move, handleClose, externalTree });
	const first = new HoverReferenceInteraction(store, options);
	const second = new HoverReferenceInteraction(store, options);

	/** Registers a trigger without making it the active one. */
	function register(id: string) {
		return (element: Element) => {
			store.triggers.add(id, element);
			return () => store.triggers.delete(id);
		};
	}
</script>

<button data-testid="first" {...first.reference} {@attach register('first')}>first</button>
<button data-testid="second" {...second.reference} {@attach register('second')}>second</button>
{#if store.open}
	<div data-testid="floating" {@attach store.registerFloating}>popup</div>
{/if}
