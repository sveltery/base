<script lang="ts">
	import { untrack } from 'svelte';

	let disabled = false;

	function sync(value = false) {
		const copied = value;
		untrack(() => {
			if (copied) return 1;
		});
	}

	sync(disabled);
</script>
