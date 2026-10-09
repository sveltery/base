<script lang="ts">
	let value = '';
	class Box {
		tracked = '';
		noteValue(next: string) {
			if (this.tracked === next) return;
			this.tracked = next;
		}
	}
	function noteValue(next: string) {
		return next;
	}
	const model = new Box();
	$effect(() => {
		model.noteValue(value);
	});
	void noteValue;
</script>
