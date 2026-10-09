<script lang="ts">
	let labelId: string | undefined;
	function publish(next: (current: string | undefined) => string | undefined) {
		if (typeof next !== 'function') return;
		labelId = 'kept';
		const current = labelId;
		next(current);
	}
	publish((value) => value);
</script>
