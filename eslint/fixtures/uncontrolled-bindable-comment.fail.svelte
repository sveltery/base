<script lang="ts">
	let { value = $bindable('') } = $props();
	// bind:value
</script>

<p>{value}</p>
