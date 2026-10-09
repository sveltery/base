<script lang="ts">
	let previous = '';
	let current = '';
	$effect(() => {
		const same = previous === current;
		if (same) return;
		previous = current;
	});
	$effect(() => {
		const picked = previous === current;
		switch (picked) {
			case true:
				return;
		}
		previous = current;
	});
</script>
