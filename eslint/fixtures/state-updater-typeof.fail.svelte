<script lang="ts">
	let labelId: string | undefined;
	function setLabelId(next: unknown) {
		labelId = typeof next === 'function' ? next(labelId) : next;
	}
	void setLabelId;
</script>
