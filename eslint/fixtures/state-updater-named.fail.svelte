<script lang="ts">
	let labelId: string | undefined;
	function setLabelId(next: string | undefined) {
		labelId = next;
	}
	function apply(current: string | undefined) {
		return current;
	}
	setLabelId(apply);
</script>
