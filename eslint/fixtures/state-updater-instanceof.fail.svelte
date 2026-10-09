<script lang="ts">
	let labelId: string | undefined;
	function publishLabel(next: unknown) {
		labelId = next instanceof Function ? next(labelId) : next;
	}
	void publishLabel;
</script>
