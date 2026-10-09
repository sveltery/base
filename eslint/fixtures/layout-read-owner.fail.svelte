<script lang="ts">
	function ownerWindow(node: HTMLElement) {
		return node.ownerDocument?.defaultView ?? window;
	}

	let el: HTMLElement | null = null;
	const style = $derived(el ? ownerWindow(el).getComputedStyle(el) : null);
</script>

<span>{style?.width}</span>
