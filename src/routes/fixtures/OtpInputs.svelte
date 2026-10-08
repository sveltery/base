<script lang="ts">
	import { OTPField } from '#lib';
</script>

{#each [0, 1, 2, 3, 4, 5] as index (index)}
	<OTPField.Input />
{/each}
