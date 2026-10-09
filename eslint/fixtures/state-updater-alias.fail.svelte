<script lang="ts">
	type Update<T> = T | ((current: T) => T);
	type LabelIdUpdate = Update<string | undefined>;
	let labelId: string | undefined;
	function setLabelId(next: LabelIdUpdate) {
		labelId = next as string | undefined;
	}
	void setLabelId;
</script>
