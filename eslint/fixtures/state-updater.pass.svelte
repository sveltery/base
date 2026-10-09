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
	function moveReturnFocus(endedBy: string, spec: unknown) {
		const fromFunction = typeof spec === 'function';
		const resolved = fromFunction ? (spec as (reason: string) => unknown)(endedBy) : spec;
		let stored = 0;
		stored = 1;
		return resolved;
	}
	moveReturnFocus('open', false);
	setLabelId('id');
	addMessageId('err');
	deleteMessageId('err');
	setLabelId(undefined);
</script>
