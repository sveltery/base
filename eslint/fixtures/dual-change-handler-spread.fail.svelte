<script lang="ts">
	function handleInput(event: Event) {
		void event;
	}
	const inputHandlers = { oninput: handleInput };
	const changeHandlers = { onchange: (event: Event) => handleInput(event) };
</script>

<input {...inputHandlers} {...changeHandlers} />
