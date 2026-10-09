<script lang="ts">
	let height: number | null = 1;
	let width: number | null = 1;

	function area() {
		if (height != null || width != null) return (height ?? 0) + (width ?? 0);
		return 0;
	}

	const size = area();
</script>

<span>{size}</span>
