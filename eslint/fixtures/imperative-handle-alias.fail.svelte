<script lang="ts">
	let {
		handle = $bindable(),
		api = $bindable()
	}: {
		handle?: { validate: () => void };
		api?: { close: () => void };
	} = $props();
	const handleBag = {
		validate() {}
	};
	const apiBag = {
		close() {}
	};
	handle = handleBag;
	api = apiBag;
</script>
