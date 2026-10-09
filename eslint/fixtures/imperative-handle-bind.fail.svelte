<script lang="ts">
	let { actions = $bindable() }: { actions?: { validate: () => void } } = $props();
	function validate() {}
	actions = { validate: validate.bind(null) };
</script>
