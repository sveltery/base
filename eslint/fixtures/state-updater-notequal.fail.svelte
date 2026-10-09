<script lang="ts">
	let labelId: string | undefined;
	function setLabelId(next: unknown) {
		if (typeof next !== 'function') {
			labelId = next as string | undefined;
			return;
		}
		labelId = next(labelId);
	}
	void setLabelId;
</script>
