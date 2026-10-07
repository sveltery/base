<script lang="ts">
	import { Toggle } from '#lib';

	let pressed = $state(false);
</script>

<input type="checkbox" aria-label="Owner pressed" bind:checked={pressed} />
<Toggle {pressed}>Bold</Toggle>
