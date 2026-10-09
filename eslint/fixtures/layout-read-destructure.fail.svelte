<script lang="ts">
	let el: HTMLElement | null = null;
	const width = $derived.by(() => {
		if (!el) return 0;
		const { offsetWidth } = el;
		return offsetWidth;
	});
</script>

<span>{width}</span>
