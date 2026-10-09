<script lang="ts">
	let revision = 0;
	let width = 0;

	const geometry = $derived.by(() => {
		void revision;
		const _width = width;
		return 0;
	});
</script>

<span>{geometry}</span>
