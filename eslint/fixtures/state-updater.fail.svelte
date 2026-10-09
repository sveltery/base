<script lang="ts">
	let labelId: string | undefined;
	function setLabelId(
		next: string | undefined | ((current: string | undefined) => string | undefined)
	) {
		labelId = next as string | undefined;
	}
	setLabelId((current) => (current === 'id' ? undefined : current));
</script>
