<script lang="ts">
	function handleInput(_event: Event) {}
	const props = {
		oninput: handleInput,
		onchange: (event: Event) => handleInput(event)
	};
	void props;
</script>
