<script lang="ts">
	let labelId: string | undefined;
	function publishLabel(next: unknown) {
		labelId = typeof next === 'function' ? next(labelId) : next;
	}
	const update = (current: string | undefined) => current;
	setLegend(update);
	void publishLabel;
</script>
