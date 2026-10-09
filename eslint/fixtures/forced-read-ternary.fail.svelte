<script lang="ts">
	import { untrack } from 'svelte';

	let disabled = false;
	let active: HTMLElement | null = null;
	let height: number | null = 1;
	let width: number | null = 1;

	function ensureActive() {
		return active;
	}

	function sync(itemDisabled: boolean) {
		return itemDisabled ? untrack(() => ensureActive()) : untrack(() => ensureActive());
	}

	const chosen = $derived(height != null ? true : width != null);

	sync(disabled);
</script>

<span>{chosen}</span>
