<script lang="ts">
	let labelId: string | undefined;
	function setLabelId(next: string | undefined) {
		labelId = next;
	}
	setLabelId((current) => (current === 'id' ? undefined : current));
</script>
