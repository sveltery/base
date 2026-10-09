<script lang="ts">
	let el: HTMLElement | null = null;

	function box(node: HTMLElement) {
		return node.getBoundingClientRect();
	}

	const rect = $derived.by(() => {
		if (!el) return null;
		return box(el);
	});

	const direct = $derived(el ? el.getBoundingClientRect() : null);
</script>

<span>{rect?.width}{direct?.width}</span>
