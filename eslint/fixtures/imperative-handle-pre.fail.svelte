<script lang="ts">
	let { actions = $bindable() }: { actions?: { validate: () => void } } = $props();
	const actionsHandle = {
		validate() {}
	};
	$effect.pre(() => {
		actions = actionsHandle;
	});
</script>
