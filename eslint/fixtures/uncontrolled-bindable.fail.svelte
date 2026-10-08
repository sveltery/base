<script lang="ts">
	let { checked = $bindable(false), pressed = $bindable(false) } = $props();
</script>

<button type="button">{checked}{pressed}</button>
