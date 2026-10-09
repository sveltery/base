<script lang="ts">
	let { actions = $bindable() }: { actions?: { validate: () => void } } = $props();
	const actionsHandle = {
		validate() {}
	};
	actions = actionsHandle;
</script>
