<script lang="ts">
	import { untrack } from 'svelte';

	function callPublic(fn: (() => void) | undefined) {
		untrack(() => {
			fn?.();
		});
	}
	callPublic(undefined);
</script>
