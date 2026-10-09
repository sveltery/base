<script lang="ts">
	let { actions = $bindable() }: { actions?: { validate: () => void } } = $props();
	function validate() {}
	$effect.pre(() => {
		actions = { validate };
	});
</script>
