<script lang="ts">
	import { useScrollLock } from '#lib/internal/popups/index.js';

	let first = $state(false);
	let second = $state(false);

	useScrollLock(() => ({ enabled: first, referenceElement: null }));
	useScrollLock(() => ({ enabled: second, referenceElement: null }));
</script>

<button type="button" onclick={() => (first = !first)}>First lock</button>
<button type="button" onclick={() => (second = !second)}>Second lock</button>
