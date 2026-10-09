<script lang="ts">
	function handleInput(event: Event) {
		void event;
	}
	function handleChange(event: Event) {
		handleInput(event);
	}
	const props = {
		oninput: handleInput,
		onchange: handleChange
	};
	void props;
</script>
