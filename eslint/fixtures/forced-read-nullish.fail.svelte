<script lang="ts">
	let height: number | null = 1;
	let width: number | null = 1;

	function subscribe() {
		if (height != null || width != null) return 1;
		return 0;
	}

	subscribe();
</script>
