<script lang="ts">
	let { actions = $bindable() }: { actions?: { validate: () => void } } = $props();
	function validate() {}
	function createActions() {
		return { validate };
	}
	actions = createActions();
</script>
