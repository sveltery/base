<script lang="ts">
	let el: HTMLElement | null = null;

	function compute() {
		if (!el) return null;
		return el.getBoundingClientRect();
	}

	const rect = $derived.by(compute);
</script>

<span>{rect?.width}</span>
