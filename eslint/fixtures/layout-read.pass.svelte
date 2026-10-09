<script lang="ts">
	let el: HTMLElement | null = null;
	let width = $state(0);

	function measure(node: HTMLElement) {
		return node.getBoundingClientRect().width;
	}

	$effect(() => {
		if (el) width = measure(el);
	});

	const label = $derived(width ? 'ready' : 'empty');
</script>

<span>{label}</span>
