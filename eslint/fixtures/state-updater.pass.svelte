<script lang="ts">
	let labelId: string | undefined;
	const messageIds = new Set<string>();
	function setLabelId(next: string | undefined) {
		labelId = next;
	}
	function addMessageId(id: string) {
		messageIds.add(id);
	}
	function deleteMessageId(id: string) {
		messageIds.delete(id);
	}
	setLabelId('id');
	addMessageId('err');
	deleteMessageId('err');
	setLabelId(undefined);
</script>
