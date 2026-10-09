<script lang="ts">
	let { actions = $bindable() }: { actions?: { validate: () => void } } = $props();
	function validate() {}
	const actionsHandle = { validate };
	actions = actionsHandle;
</script>
