<script lang="ts">
	function handleInput(_event: Event) {}
	const props = {
		oninput: handleInput,
		onchange: handleInput
	};
	void props;
</script>

<input {...props} />
